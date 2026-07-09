import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMemo, deleteMemo, fetchMemos, type Memo } from "./api";
import { useState } from "react";

function App() {
  const queryClient = useQueryClient(); //쿼리 무효화 위해 클라이언트 가져오기
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // 1. 메모 목록 조회
  const {
    data: memos,
    isLoading,
    isError,
  } = useQuery<Memo[]>({
    queryKey: ["memos"],
    queryFn: fetchMemos,
  });
  // 2. 메모 추가 Mutation 설정
  const mutation = useMutation({
    mutationFn: createMemo,
    onSuccess: () => {
      // 메모 추가 성공 시 'memos'라는 이름표를 가진 캐시 데이터를 무효화(삭제)함
      // -> TanStack Query가 서버에서 최신 목록을 자동으로 다시 불러옴(Refetch)
      queryClient.invalidateQueries({ queryKey: ["memos"] });
      setTitle(""); //입력창 초기화
      setContent("");
    },
  });
  // 삭제 Mutation (낙관적 업데이트 적용)
  const deleteMutation = useMutation({
    mutationFn: deleteMemo,
    // 1. 요청 직후 실행: UI를 먼저 변경
    onMutate: async (deletedId) => {
      // 진행 중인 데이터 갱신을 멈춤 (충돌 방지)
      await queryClient.cancelQueries({ queryKey: ["memos"] });
      // 에러 시 되돌리기 위해 현재(이전) 데이터를 백업
      const previousMemos = queryClient.getQueryData(["memos"]);
      // 캐시를 즉시 수정하여 화면에서 해당 메모 제거
      queryClient.setQueryData(["memos"], (old: Memo[] | undefined) =>
        old ? old.filter((memo) => memo.id !== deletedId) : [],
      );
      // 백업 데이터를 반환 (onError에서 사용)
      return { previousMemos };
    },
    // 2. 에러 발생 시: 백업해둔 데이터로 롤백
    onError: (_err, _deletedId, context) => {
      if (context?.previousMemos) {
        queryClient.setQueryData(["memos"], context.previousMemos);
      }
    },
    // 3. 성공/실패 무관하게 종료 시: 서버와 최종 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["memos"] });
    },
  });
  //삭제 이벤트 처리 함수
  const handleDelete = (id: string | undefined) => {
    if (id) deleteMutation.mutate(id);
  };
  //서브밋 이벤트 처리함수
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return; //입력내용 없으면 되돌아감
    // mutation 실행 (메모객체를 입력)
    mutation.mutate({ title, content });
  };

  if (isLoading)
    return <div className="p-8 text-center text-xl">메모를 불러오는 중...</div>;
  if (isError)
    return <div className="p-8 text-center text-red-500">데이터 로드 실패</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">나의 메모 앱</h1>

        {/* 메모 작성 폼 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {mutation.isPending ? "저장 중..." : "메모 추가"}
          </button>
        </form>

        {/* 메모 목록 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memos?.map((memo) => (
            <div
              key={memo.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {memo.title}
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {memo.content}
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                  수정
                </button>
                <button
                  onClick={() => handleDelete(memo.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          {memos?.length === 0 && (
            <p className="text-gray-500 col-span-2 text-center py-12">
              작성된 메모가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

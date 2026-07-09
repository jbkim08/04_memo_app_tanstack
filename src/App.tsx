import { useQuery } from "@tanstack/react-query";
import { fetchMemos, type Memo } from "./api";

function App() {
  // 2. useQuery를 통한 데이터 패칭
  const {
    data: memos,
    isLoading,
    isError,
  } = useQuery<Memo[]>({
    queryKey: ["memos"],
    queryFn: fetchMemos,
  });

  if (isLoading)
    return <div className="p-8 text-center text-xl">메모를 불러오는 중...</div>;
  if (isError)
    return <div className="p-8 text-center text-red-500">데이터 로드 실패</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">나의 메모 앱</h1>

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
                <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
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

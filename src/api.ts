import axios from "axios";

//백엔드 주소를 설정한 api를 외부에서 사용
export const api = axios.create({
  baseURL: "http://localhost:8000",
});

//인터페이스 메모 타입
export interface Memo {
  id?: string;
  title: string;
  content: string;
}

// 1. 메모 목록을 가져오는 API 함수
export const fetchMemos = async (): Promise<Memo[]> => {
  const { data } = await api.get("/memos");
  return data;
};

// 2. 새 메모를 입력하고 백엔드에서 입력된 메모를 리턴
export const createMemo = async (newMemo: Memo): Promise<Memo> => {
  const { data } = await api.post("/memos", newMemo);
  return data;
};

// 3. id로 메모를 삭제
export const deleteMemo = async (id: string): Promise<void> => {
  await api.delete(`/memos/${id}`);
};

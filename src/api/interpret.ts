export type InterpretRequest = {
  text: string;
  dates: string[];
  companion: string;
  destinations: string[];
};

export type PhraseMapping = { phrase: string; purposes: string[] };
export type InterpretResult = {
  purposes: string[];
  summary: string;
  mappings?: PhraseMapping[];
};
const BASE_URL = 'https://optrip-server.fly.dev';

export async function interpretTravel(request: InterpretRequest): Promise<InterpretResult> {
  const response = await fetch(`${BASE_URL}/api/interpret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`여행 내용 해석 요청 실패 (${response.status})`);
  return (await response.json()) as InterpretResult;
}

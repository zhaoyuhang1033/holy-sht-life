import { Talent, TurnData, Attribute } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// 获取随机天赋（静态库）
export async function fetchTalents(count: number = 10): Promise<Talent[]> {
  const response = await fetch(`${API_BASE_URL}/talents?count=${count}`);
  if (!response.ok) {
    throw new Error('获取天赋失败');
  }
  return response.json();
}

// 获取AI动态生成的天赋
export async function fetchAITalents(): Promise<Talent[]> {
  const response = await fetch(`${API_BASE_URL}/talents/ai`);
  if (!response.ok) {
    throw new Error('AI生成天赋失败');
  }
  return response.json();
}

// 开始游戏
export async function startGame(
  selectedTalents: Talent[],
  allocatedPoints: Attribute,
  sessionId: string
): Promise<TurnData> {
  const response = await fetch(`${API_BASE_URL}/game/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selected_talents: selectedTalents,
      allocated_points: allocatedPoints,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error('开始游戏失败');
  }

  return response.json();
}

// 做出选择
export async function makeChoice(
  choiceId: string,
  currentAttributes: Attribute,
  sessionId: string,
  choiceText?: string
): Promise<TurnData> {
  const response = await fetch(`${API_BASE_URL}/game/choice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      choice_id: choiceId,
      current_attributes: currentAttributes,
      session_id: sessionId,
      choice_text: choiceText,
    }),
  });

  if (!response.ok) {
    throw new Error('提交选择失败');
  }

  return response.json();
}
export interface StreamHandlers {
  onStart?: (payload: { message: string }) => void;
  onDelta?: (payload: { text: string }) => void;
  onDone: (payload: TurnData) => void;
  onError?: (payload: { message: string }) => void;
}

export async function makeChoiceStream(
  choiceId: string,
  currentAttributes: Attribute,
  sessionId: string,
  choiceText: string,
  handlers: StreamHandlers
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/game/choice/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      choice_id: choiceId,
      current_attributes: currentAttributes,
      session_id: sessionId,
      choice_text: choiceText,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error('流式提交选择失败');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() || '';

    for (const chunk of chunks) {
      const lines = chunk.split('\n');
      const eventLine = lines.find((line) => line.startsWith('event:'));
      const dataLine = lines.find((line) => line.startsWith('data:'));
      if (!eventLine || !dataLine) continue;

      const event = eventLine.replace('event:', '').trim();
      const data = JSON.parse(dataLine.replace('data:', '').trim());

      if (event === 'start') handlers.onStart?.(data);
      if (event === 'delta') handlers.onDelta?.(data);
      if (event === 'done') handlers.onDone(data);
      if (event === 'error') handlers.onError?.(data);
    }
  }
}




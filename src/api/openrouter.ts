const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1';

export async function sendMessage(messages: { role: string; content: string }[]) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173', // OpenRouter просит Referer для безопасности
      'X-Title': 'GigaChat Clone', // Название приложения
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo', // можно заменить на другую модель
      messages: messages,
      stream: false, // пока без stream
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Ошибка запроса');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
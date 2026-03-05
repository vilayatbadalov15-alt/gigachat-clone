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
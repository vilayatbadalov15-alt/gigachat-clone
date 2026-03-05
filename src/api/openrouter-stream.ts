const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1';

export async function sendMessageStream(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'GigaChat Clone',
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: messages,
      stream: true, // Включаем поток
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Ошибка запроса');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          onDone();
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          console.error('Ошибка парсинга:', e);
        }
      }
    }
  }
}
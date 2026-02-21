export async function createEmbedding(
  texts: string[],
  apiKey: string,
  model: string = 'text-embedding-3-small',
  dimensions: number = 1024
): Promise<number[][]> {
  const response = await fetch('/api/embedding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ texts, model, dimensions }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Embedding failed');
  }

  const data = await response.json();
  return data.embeddings;
}

export async function* streamChat(
  messages: { role: string; content: string }[],
  apiKey: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.3,
  maxTokens: number = 1000
): AsyncGenerator<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ messages, model, temperature, maxTokens }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Chat failed');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip non-JSON lines
        }
      }
    }
  }
}

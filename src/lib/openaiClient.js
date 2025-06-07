const API_URL = 'https://api.openai.com/v1/images/variations';

export async function createImageVariation({ file, prompt, n = 1, size = '1024x1024' }) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', prompt);
  formData.append('n', n);
  formData.append('size', size);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: formData
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message);
  }

  const data = await res.json();
  return data.data?.[0]?.url || '';
}

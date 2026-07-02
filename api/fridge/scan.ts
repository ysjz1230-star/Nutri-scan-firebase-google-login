import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Base64 image is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      message: 'Claude API key not configured. Returning mock data.',
      ingredients: [
        { name: '달걀', name_en: 'egg', quantity: '6개' },
        { name: '우유', name_en: 'milk', quantity: '1L' },
        { name: '당근', name_en: 'carrot', quantity: '2개' },
      ],
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: image },
              },
              {
                type: 'text',
                text: `이 냉장고 사진에서 보이는 식재료를 모두 찾아 JSON 배열로만 반환해줘.
형식: { "ingredients": [{"name": "재료명", "name_en": "English", "quantity": "추정량"}] }
JSON 외 다른 텍스트는 절대 포함하지 마.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '{}';
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

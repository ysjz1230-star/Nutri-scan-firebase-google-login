import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Fridge API ready. Connect NeonDB for persistence.',
      items: [],
    });
  }

  if (req.method === 'POST') {
    const { name, nameEn, quantity, location } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    return res.status(201).json({
      message: 'Fridge item added',
      data: { name, nameEn, quantity, location },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

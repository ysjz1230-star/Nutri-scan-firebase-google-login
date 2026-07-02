import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Allergy API ready. Connect NeonDB for persistence.',
      allergies: [],
    });
  }

  if (req.method === 'POST') {
    const { allergen, severity, notes } = req.body;
    if (!allergen) {
      return res.status(400).json({ error: 'Allergen is required' });
    }
    return res.status(201).json({
      message: 'Allergy added',
      data: { allergen, severity, notes },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

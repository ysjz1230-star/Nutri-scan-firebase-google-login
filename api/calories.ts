import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { date } = req.query;
    return res.status(200).json({
      message: 'Calorie API ready. Connect NeonDB for persistence.',
      date: date || new Date().toISOString().split('T')[0],
      logs: [],
    });
  }

  if (req.method === 'POST') {
    const { mealType, foodName, caloriesKcal } = req.body;
    if (!foodName || !caloriesKcal) {
      return res.status(400).json({ error: 'foodName and caloriesKcal are required' });
    }
    return res.status(201).json({
      message: 'Calorie log added',
      data: { mealType, foodName, caloriesKcal },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

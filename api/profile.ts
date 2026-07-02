import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Profile API ready. Connect NeonDB for persistence.',
    });
  }

  if (req.method === 'PUT') {
    const { gender, birthYear, heightCm, weightKg, activityLevel, goal } = req.body;
    if (!gender || !birthYear || !heightCm || !weightKg) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    return res.status(200).json({
      message: 'Profile updated',
      data: { gender, birthYear, heightCm, weightKg, activityLevel, goal },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

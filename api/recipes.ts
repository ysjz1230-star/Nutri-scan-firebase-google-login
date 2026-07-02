import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ingredients, intolerances } = req.query;
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      message: 'Spoonacular API key not configured. Returning mock data.',
      recipes: [
        {
          id: 1,
          title: 'Scrambled Eggs with Spinach',
          image: '',
          usedIngredientCount: 2,
          missedIngredientCount: 1,
        },
      ],
    });
  }

  try {
    const params = new URLSearchParams({
      ingredients: String(ingredients || ''),
      intolerances: String(intolerances || ''),
      number: '12',
      ranking: '2',
      ignorePantry: 'true',
      apiKey,
    });

    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?${params}`
    );
    const recipes = await response.json();

    return res.status(200).json({ recipes });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch recipes',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

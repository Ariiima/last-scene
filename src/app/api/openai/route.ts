import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that suggests TV series and movies. Provide 5 relevant suggestions based on the user\'s input. Return only the titles without any additional text.'
        },
        {
          role: 'user',
          content: `Suggest 5 TV series or movies similar to or containing the text: "${query}"`
        }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 150,
    });

    const suggestions = completion.choices[0].message.content
      ?.split('\n')
      .filter(Boolean)
      .map(title => title.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5) || [];

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
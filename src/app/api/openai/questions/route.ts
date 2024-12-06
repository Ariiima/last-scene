import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { show } = body;

    if (!show) {
      return NextResponse.json(
        { error: 'Show name is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates questions to help users remember where they left off in a TV series. Generate 5 questions that will help determine the last episode they watched. The questions should be specific to helping locate their last watched episode.'
        },
        {
          role: 'user',
          content: `Generate 5 questions to help determine where someone left off watching "${show}". The questions should help identify the last episode they watched.`
        }
      ],
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 300,
    });

    const questions = completion.choices[0].message.content
      ?.split('\n')
      .filter(Boolean)
      .map(q => q.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5) || [];

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
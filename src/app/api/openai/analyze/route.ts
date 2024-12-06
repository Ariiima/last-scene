import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { show, questions, answers } = body;

    if (!show || !questions || !answers || questions.length !== answers.length) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Create a formatted Q&A string
    const qaString = questions
      .map((q: string, i: number) => `Q: ${q}\nA: ${answers[i]}`)
      .join('\n\n');

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes user responses about a TV series to determine where they left off watching. Based on their answers, determine the most likely episode or point in the series where they stopped watching. Be specific about the season and episode if possible, or describe the story point where they likely stopped.'
        },
        {
          role: 'user',
          content: `Based on these answers about the TV show "${show}", determine where the viewer likely stopped watching. Here are their responses:\n\n${qaString}`
        }
      ],
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 200,
    });

    const analysis = completion.choices[0].message.content?.trim() || 'Unable to determine the last watched episode.';

    return NextResponse.json({ result: analysis });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
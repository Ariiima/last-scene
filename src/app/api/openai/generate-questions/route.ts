import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Question {
  question: string;
  context: string;
  category: 'plot' | 'character' | 'event' | 'emotion' | 'detail';
}

interface GenerateQuestionsResponse {
  questions: Question[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
  {
    name: 'generateQuestions',
    description: 'Generate questions to help determine where a viewer stopped watching a TV show',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          description: 'Array of questions to ask the viewer',
          items: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'The question to ask the viewer'
              },
              context: {
                type: 'string',
                description: 'Brief context about why this question is important (for internal use)'
              },
              category: {
                type: 'string',
                enum: ['plot', 'character', 'event', 'emotion', 'detail'],
                description: 'The category of the question'
              }
            },
            required: ['question', 'context', 'category']
          }
        }
      },
      required: ['questions']
    }
  }
];

export async function POST(request: Request) {
  try {
    const { show } = await request.json();

    if (!show) {
      return NextResponse.json(
        { error: 'Show name is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are LastScene's TV show analysis expert, specializing in helping viewers remember where they stopped watching shows.

Key Guidelines:
- Generate questions that progressively help narrow down the viewer's last watched episode
- Mix different types of questions (plot points, character developments, emotional moments, memorable scenes)
- Avoid major spoilers while being specific enough to jog memory
- Focus on memorable moments that would stick in a viewer's mind
- Include questions about character relationships and story arcs
- Consider both major plot points and smaller, memorable details

Remember: The goal is to help viewers pinpoint their last watched episode through memory triggers.`
        },
        {
          role: "user",
          content: `Generate 5 strategic questions to help determine where someone stopped watching "${show}". 

The questions should:
1. Progress from general to specific
2. Cover different aspects (plot, characters, memorable moments)
3. Be engaging and memory-triggering
4. Avoid major spoilers
5. Help pinpoint specific episodes or story arcs`
        }
      ],
      functions,
      function_call: { name: 'generateQuestions' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const functionCall = completion.choices[0].message.function_call;
    
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to generate questions');
    }

    const { questions } = JSON.parse(functionCall.arguments) as GenerateQuestionsResponse;

    // Only return the question text for the frontend
    const questionTexts = questions.map((q: Question) => q.question);

    return NextResponse.json({ questions: questionTexts });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 
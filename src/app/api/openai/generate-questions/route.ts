import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRateLimitInfo, incrementRateLimit } from '@/lib/rate-limit';
import { preWrittenQuestions } from '@/lib/pre-written-questions';

interface Question {
  question: string;
  context: string;
  category: 'plot' | 'character' | 'event' | 'emotion' | 'detail';
  type: 'yes_no';
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
    description: 'Generate yes/no questions to help determine where a viewer stopped watching a TV show',
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
                description: 'The yes/no question to ask the viewer'
              },
              context: {
                type: 'string',
                description: 'Brief context about why this question is important (for internal use)'
              },
              category: {
                type: 'string',
                enum: ['plot', 'character', 'event', 'emotion', 'detail'],
                description: 'The category of the question'
              },
              type: {
                type: 'string',
                enum: ['yes_no'],
                description: 'The type of question - always yes/no'
              }
            },
            required: ['question', 'context', 'category', 'type']
          }
        }
      },
      required: ['questions']
    }
  }
];

export async function POST(request: Request) {
  try {
    // Check rate limit
    const { isRateLimited, remainingUses, hoursUntilReset } = await getRateLimitInfo();

    if (isRateLimited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Daily limit reached. Please try again in ${hoursUntilReset} hours.`,
          hoursUntilReset,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset-Hours': hoursUntilReset.toString(),
          }
        }
      );
    }

    const { show } = await request.json();

    if (!show) {
      return NextResponse.json(
        { error: 'Show name is required' },
        { status: 400 }
      );
    }

    // Check for pre-written questions
    const preWritten = preWrittenQuestions[show];
    if (preWritten) {
      // Increment rate limit after successful response
      await incrementRateLimit();

      return NextResponse.json({ 
        questions: preWritten.questions,
        remainingUses: remainingUses - 1,
        hoursUntilReset,
        isPreWritten: true,
        totalSeasons: preWritten.totalSeasons,
        yearRange: preWritten.yearRange,
        briefDescription: preWritten.briefDescription
      }, {
        headers: {
          'X-RateLimit-Remaining': (remainingUses - 1).toString(),
          'X-RateLimit-Reset-Hours': hoursUntilReset.toString(),
        }
      });
    }

    // If no pre-written questions, use OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are LastScene's TV show expert, helping viewers remember where they stopped watching shows.

Key Guidelines for Generating Yes/No Questions:
1. Questions MUST be answerable with "Yes", "No", or "Not Sure"
2. Progress from general to specific
3. Focus on memorable moments, major plot points, and character developments
4. Keep questions simple and straightforward
5. Avoid spoilers for episodes after the one being discussed
6. Mix different types:
   - Plot developments
   - Character arcs
   - Memorable scenes
   - Emotional moments
   - Key locations or items
           
Example Questions:
- "Do you remember seeing [specific major event]?"
- "Was [character] still alive in your last watched episode?"
- "Had [location/item] been introduced yet?"
- "Were [characters] still enemies at this point?"
- "Had [major plot point] been revealed yet?"

Remember: Questions should help pinpoint the exact episode through memory triggers.`
        },
        {
          role: "user",
          content: `Generate 5 strategic yes/no questions to help determine where someone stopped watching "${show}". 

The questions should:
1. Be answerable with Yes/No/Not Sure
2. Progress from general to specific
3. Cover different aspects (plot, characters, memorable moments)
4. Be engaging and memory-triggering
5. Avoid major spoilers
6. Help pinpoint specific episodes or story arcs`
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

    // Increment rate limit after successful question generation
    await incrementRateLimit();

    // Only return the question text for the frontend
    const questionTexts = questions.map((q: Question) => q.question);

    return NextResponse.json({ 
      questions: questionTexts,
      remainingUses: remainingUses - 1,
      hoursUntilReset,
      isPreWritten: false
    }, {
      headers: {
        'X-RateLimit-Remaining': (remainingUses - 1).toString(),
        'X-RateLimit-Reset-Hours': hoursUntilReset.toString(),
      }
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 
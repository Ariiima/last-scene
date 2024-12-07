import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the type for the analysis response
type AnalysisResponse = {
  lastWatchedPoint: {
    season?: number;
    episode?: number;
    description: string;
  };
  confidence: number;
  followUpQuestions?: string[];
};

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
          content: 'You are a helpful assistant that analyzes user responses about a TV series to determine where they left off watching. Provide structured output with the last watched point, confidence level, and follow-up questions if needed.'
        },
        {
          role: 'user',
          content: `Based on these answers about the TV show "${show}", determine where the viewer likely stopped watching. Here are their responses:\n\n${qaString}`
        }
      ],
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 500,
      functions: [
        {
          name: 'analyzeWatchingProgress',
          description: 'Analyze where the viewer stopped watching the show',
          parameters: {
            type: 'object',
            properties: {
              lastWatchedPoint: {
                type: 'object',
                properties: {
                  season: {
                    type: 'number',
                    description: 'The season number where the viewer likely stopped'
                  },
                  episode: {
                    type: 'number',
                    description: 'The episode number where the viewer likely stopped'
                  },
                  description: {
                    type: 'string',
                    description: 'Detailed description of the point where the viewer likely stopped'
                  }
                },
                required: ['description']
              },
              confidence: {
                type: 'number',
                description: 'Confidence level in the analysis (0-1)'
              },
              followUpQuestions: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Additional questions to ask if confidence is low or more clarity is needed'
              }
            },
            required: ['lastWatchedPoint', 'confidence']
          }
        }
      ],
      function_call: { name: 'analyzeWatchingProgress' }
    });

    const functionResponse = completion.choices[0].message.function_call?.arguments;
    
    if (!functionResponse) {
      throw new Error('Failed to get structured response from OpenAI');
    }

    const analysis: AnalysisResponse = JSON.parse(functionResponse);

    // If confidence is low, always include follow-up questions
    if (analysis.confidence < 0.9 && !analysis.followUpQuestions) {
      analysis.followUpQuestions = [
        "Do you remember any specific character deaths or major plot twists?",
        "Can you recall any significant locations or settings from your last watched episode?",
        "What was the main conflict or problem the characters were dealing with when you stopped watching?"
      ];
    }

    return NextResponse.json({ result: analysis });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
'use client'

import { useState, useEffect } from 'react'
import Question from '@/components/Question'
import ProgressBar from '@/components/ProgressBar'
import { Loader2 } from 'lucide-react'

interface QuestionFlowProps {
  show: string
  onComplete: (result: string) => void
}

export default function QuestionFlow({ show, onComplete }: QuestionFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/openai/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ show }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        if (data.questions) {
          setQuestions(data.questions);
        } else {
          throw new Error('No questions received');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [show]);

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setLoading(true);
      try {
        const response = await fetch('/api/openai/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            show,
            questions,
            answers: newAnswers,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze answers');
        }

        const data = await response.json();
        if (data.result) {
          onComplete(data.result);
        } else {
          throw new Error('No result received');
        }
      } catch (error) {
        console.error('Error analyzing answers:', error);
        setError('Failed to analyze answers. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar current={currentQuestion + 1} total={questions.length || 5} />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-gray-400">Thinking...</p>
        </div>
      ) : (
        questions.length > 0 && (
          <Question
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
            onBack={handleBack}
            showBack={currentQuestion > 0}
          />
        )
      )}
    </div>
  );
}


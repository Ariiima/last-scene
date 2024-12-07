'use client';

import { useState, useEffect } from 'react';
import { LoadingAnimation } from './LoadingAnimation';
import { RateLimitError } from './RateLimitError';
import { motion } from 'framer-motion';

interface ShowAnalyzerProps {
  show: string;
}

interface Question {
  question: string;
}

interface ApiResponse {
  questions: string[];
  error?: string;
  message?: string;
  hoursUntilReset?: number;
  remainingUses?: number;
  isPreWritten?: boolean;
}

export const ShowAnalyzer = ({ show }: ShowAnalyzerProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; hoursUntilReset?: number } | null>(null);

  const fetchQuestions = async () => {
    if (!show) {
      setError({ message: 'Please enter a show name' });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching questions for:', show);
      const response = await fetch('/api/openai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show }),
      });

      const data: ApiResponse = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        if (response.status === 429) {
          setError({
            message: data.message || 'Rate limit exceeded',
            hoursUntilReset: data.hoursUntilReset
          });
        } else {
          setError({ message: data.error || 'Failed to generate questions' });
        }
        return;
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        console.error('Invalid questions format:', data);
        setError({ message: 'Invalid response format from server' });
        return;
      }

      setQuestions(data.questions);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError({ message: 'Failed to connect to the server' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [show]);

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error?.hoursUntilReset) {
    return (
      <RateLimitError
        hoursUntilReset={error.hoursUntilReset}
        onRetry={fetchQuestions}
      />
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error.message}
        </motion.span>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center p-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          No questions available. Please try again.
        </motion.span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-800 dark:text-gray-200">{question}</p>
        </motion.div>
      ))}
    </div>
  );
}; 
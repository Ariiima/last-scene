'use client'

import { useState } from 'react'
import Question from '@/components/Question'
import ProgressBar from './ProgressBar'

interface QuestionFlowProps {
  show: string
  onComplete: (result: string) => void
}

export default function QuestionFlow({ show, onComplete }: QuestionFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const questions = [
    `When did you last watch an episode of ${show}?`,
    `Do you remember any specific characters or plot points from ${show}?`,
    `Can you recall any major events that happened in the last episode you watched?`,
    `Were there any cliffhangers or unresolved plot points?`,
    `Is there anything else you remember about where you left off in ${show}?`,
  ]

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setLoading(true)
      // Simulate API call to LLM
      setTimeout(() => {
        setLoading(false)
        onComplete(`Based on your answers, you likely stopped watching ${show} at Season 2, Episode 7.`)
      }, 2000)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  return (
    <div className="space-y-6">
      <ProgressBar current={currentQuestion + 1} total={questions.length} />
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      ) : (
        <Question
          question={questions[currentQuestion]}
          onAnswer={handleAnswer}
          onBack={handleBack}
          showBack={currentQuestion > 0}
        />
      )}
    </div>
  )
}


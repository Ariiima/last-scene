'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface QuestionProps {
  question: string
  onAnswer: (answer: string) => void
  onBack: () => void
  showBack: boolean
}

export default function Question({ question, onAnswer, onBack, showBack }: QuestionProps) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim()) {
      onAnswer(answer)
      setAnswer('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-2 sm:px-0">
      <label className="block text-base sm:text-lg font-medium text-gray-200">{question}</label>
      <Input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full bg-gray-800 text-white border-gray-700 focus:border-red-500"
        placeholder="Type your answer here"
      />
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
        {showBack && (
          <Button type="button" onClick={onBack} variant="outline" className="w-full sm:w-auto flex items-center justify-center text-gray-300">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Button 
          type="submit" 
          className="w-full sm:w-auto ml-0 sm:ml-auto flex items-center justify-center bg-red-600 hover:bg-red-700" 
          disabled={!answer.trim()}
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <Button 
        type="button" 
        onClick={() => onAnswer("Not sure")} 
        variant="ghost" 
        className="w-full mt-2 text-gray-300 text-sm sm:text-base"
      >
        I'm not sure
      </Button>
    </form>
  )
}


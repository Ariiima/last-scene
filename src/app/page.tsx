'use client'

import { useState } from 'react'
import LandingPage from '@/components/LandingPage'
import QuestionFlow from '@/components/QuestionFlow'
import ResultView from '@/components/ResultView'
import { SeriesAutocomplete } from '@/components/SeriesAutocomplete'

export default function SeriesDropFinder() {
  const [stage, setStage] = useState<'landing' | 'questions' | 'result'>('landing')
  const [show, setShow] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const handleStart = (showName: string) => {
    setShow(showName)
    setStage('questions')
  }

  const handleComplete = (finalResult: string) => {
    setResult(finalResult)
    setStage('result')
  }

  const handleReset = () => {
    setStage('landing')
    setShow('')
    setResult(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 radial-gradient bg-black">
      <div className="w-full max-w-2xl mx-4 sm:mx-auto bg-gray-900 bg-opacity-90 p-6 sm:p-12 rounded-xl shadow-2xl">
        {stage === 'landing' && <LandingPage onStart={handleStart} />}
        {stage === 'questions' && <QuestionFlow show={show} onComplete={handleComplete} />}
        {stage === 'result' && result && <ResultView result={result} onReset={handleReset} />}
      </div>
    </div>
  )
}


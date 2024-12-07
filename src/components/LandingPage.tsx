'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

interface LandingPageProps {
  onStart: (show: string) => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [show, setShow] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (show.trim()) {
      onStart(show)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6 sm:space-y-8"
    >
      <h1 className="text-4xl sm:text-6xl font-extrabold">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-400 to-orange-500">
          LastScene
        </span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 px-4 sm:px-0">
        Find the last scene you watched in your favorite TV series
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 px-2 sm:px-0">
        <Input
          type="text"
          value={show}
          onChange={(e) => setShow(e.target.value)}
          placeholder="Enter the name of the TV show"
          className="w-full max-w-md mx-auto bg-gray-800 text-white border-gray-700 focus:border-red-500"
        />
        <Button 
          type="submit" 
          size="lg" 
          className="w-full max-w-md mx-auto bg-red-600 hover:bg-red-700 text-white text-base sm:text-lg"
          disabled={!show.trim()}
        >
          Find My Episode
        </Button>
      </form>
      <p className="text-xs sm:text-sm text-gray-400">
        © 2024 LastScene. All rights reserved.
      </p>
    </motion.div>
  )
}


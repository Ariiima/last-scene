'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const [showName, setShowName] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showName.trim()) {
      router.push(`/analyze/${encodeURIComponent(showName.trim())}`)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-2 xs:p-4 sm:p-8 radial-gradient">
      <div className="w-full max-w-2xl mx-2 xs:mx-4 sm:mx-auto bg-gray-900/80 p-4 xs:p-6 sm:p-8 lg:p-12 rounded-lg xs:rounded-xl shadow-xl border border-orange-900/20 radial-gradient-subtle">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-2 xs:mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
            LastScene
          </h1>
          <p className="text-base xs:text-lg text-orange-100/80 mb-4 xs:mb-6 sm:mb-8 px-2">
            Enter your TV show name and we'll help you remember where you stopped watching
          </p>
        </div>

        <Card className="bg-gray-800/60 border-orange-900/30 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="p-3 xs:p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-200/50 h-4 xs:h-5 w-4 xs:w-5" />
              <Input
                type="text"
                placeholder="Enter TV show name..."
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
                className="pl-9 xs:pl-10 h-10 xs:h-12 text-base xs:text-lg bg-gray-800/80 border-orange-900/30 text-orange-50 placeholder-orange-200/30 focus:border-orange-500/50 focus:ring-orange-500/30"
              />
            </div>
            <Button
              type="submit"
              disabled={!showName.trim()}
              className="w-full h-10 xs:h-12 text-base xs:text-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-900/20"
            >
              Find My Episode
              <ArrowRight className="ml-2 h-4 xs:h-5 w-4 xs:w-5" />
            </Button>
          </form>
        </Card>

        <div className="mt-6 sm:mt-8 lg:mt-12 grid grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 lg:gap-6">
          {['Breaking Bad', 'Game of Thrones', 'Friends'].map((show) => (
            <Card
              key={show}
              className="p-3 xs:p-4 cursor-pointer hover:scale-105 transition-all duration-200 bg-gray-800/60 border-orange-900/30 hover:bg-gray-800/80 hover:border-orange-500/30 group backdrop-blur-sm"
              onClick={() => router.push(`/analyze/${encodeURIComponent(show)}`)}
            >
              <div className="text-center">
                <h3 className="font-medium text-sm xs:text-base sm:text-lg mb-1 xs:mb-2 text-orange-50 group-hover:text-orange-200 truncate px-1">{show}</h3>
                <p className="text-xs xs:text-sm text-orange-200/50 group-hover:text-orange-200/70">Find where you left off</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}


import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface ResultViewProps {
  result: string
  onReset: () => void
}

export default function ResultView({ result, onReset }: ResultViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 text-center px-2 sm:px-0"
    >
      <h2 className="text-2xl sm:text-3xl font-semibold text-red-500">Here's where you left off:</h2>
      <p className="text-lg sm:text-xl text-gray-300">{result}</p>
      <Button 
        onClick={onReset} 
        size="lg" 
        className="flex items-center justify-center w-full sm:w-auto bg-red-600 hover:bg-red-700"
      >
        <RefreshCw className="mr-2 h-5 w-5" /> Start Over
      </Button>
    </motion.div>
  )
}


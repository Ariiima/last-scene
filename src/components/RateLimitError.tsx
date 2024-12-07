import { motion } from 'framer-motion';

interface RateLimitErrorProps {
  hoursUntilReset: number;
  onRetry: () => void;
}

export const RateLimitError = ({ hoursUntilReset, onRetry }: RateLimitErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
      {/* Sad Face Animation */}
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: [0.8, 1.1, 0.9, 1],
          rotate: [0, 0, -10, 0]
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="text-6xl mb-4 inline-block"
      >
        😢
      </motion.span>

      {/* Error Message */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-orange-500">
            Daily Limit Reached
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            You've used all your free questions for today. Please come back in{' '}
            <span className="font-semibold text-orange-500">
              {hoursUntilReset} {hoursUntilReset === 1 ? 'hour' : 'hours'}
            </span>
          </p>
        </motion.div>
      </div>

      {/* Timer Visual */}
      <div className="relative w-20 h-20">
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full h-full"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#FED7AA"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#F97316"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{
              rotate: "-90deg",
              transformOrigin: "center",
            }}
          />
        </motion.svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm font-medium text-orange-500"
          >
            {hoursUntilReset}h
          </motion.span>
        </div>
      </div>

      {/* Retry Button */}
      <motion.button
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2 mt-4 text-white bg-orange-500 rounded-lg shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors"
      >
        Try Again
      </motion.button>

    </div>
  );
}; 
import { motion, HTMLMotionProps } from 'framer-motion';

export const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: '4px solid',
            borderColor: 'rgba(249, 115, 22, 0.3)',
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: '4px solid transparent',
            borderTopColor: 'rgb(249, 115, 22)',
          }}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '9999px',
            background: 'linear-gradient(to bottom right, rgb(251, 146, 60), rgb(245, 158, 11))',
          }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          color: 'rgba(254, 215, 170, 0.7)',
          fontSize: '0.875rem',
        }}
      >
        Thinking...
      </motion.p>
    </div>
  );
}; 
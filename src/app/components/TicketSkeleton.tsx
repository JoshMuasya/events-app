// components/TicketCardSkeleton.tsx
'use client'

import { motion } from 'framer-motion'

const shimmerVariant = {
  animate: {
    backgroundPosition: ['-200% 0', '200% 0'],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear',
    },
  },
}

const TicketCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative h-40 bg-[#1d0531] border-2 border-[#6A0DAD] shadow-lg rounded-[12px] flex items-center justify-center overflow-hidden min-w-[300px] w-full"
      style={{
        clipPath: `polygon(
          10% 0%, 90% 0%, 90% 20%, 100% 20%, 100% 80%, 
          90% 80%, 90% 100%, 10% 100%, 10% 80%, 0% 80%, 
          0% 20%, 10% 20%
        )`
      }}
    >
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD70033] to-transparent bg-[length:200%_100%] z-0"
        variants={shimmerVariant}
        animate="animate"
      />

      {/* Ticket content placeholder */}
      <div className="relative z-10 text-center space-y-2">
        <div className="h-5 w-32 rounded bg-[#5e1aa5]/80 mx-auto" />
        <div className="h-3 w-24 rounded bg-[#4e188c]/80 mx-auto" />
      </div>
    </motion.div>
  )
}

export default TicketCardSkeleton

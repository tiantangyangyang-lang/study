import { motion } from 'motion/react'

interface StepNarrationProps {
  narration: string
  reducedMotion: boolean
}

export default function StepNarration({
  narration,
  reducedMotion,
}: StepNarrationProps) {
  return (
    <motion.div
      className="step-narration"
      key={narration}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: 'easeOut' }}
    >
      {narration}
    </motion.div>
  )
}

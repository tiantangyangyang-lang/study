import { motion } from 'motion/react'
import MathMarkdown from './MathMarkdown'

interface StepNarrationProps {
  markdown: string
  reducedMotion: boolean
}

export default function StepNarration({
  markdown,
  reducedMotion,
}: StepNarrationProps) {
  return (
    <motion.div
      className="step-narration"
      key={markdown}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: 'easeOut' }}
    >
      <MathMarkdown>{markdown}</MathMarkdown>
    </motion.div>
  )
}

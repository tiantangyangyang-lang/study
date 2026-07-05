import { motion } from 'motion/react'
import MotionFormulaBlock from './MotionFormulaBlock'

interface BlackboardProps {
  text?: string
  formula?: string
  transform?: {
    fromFormula: string
    toFormula: string
    changedTokens?: string[]
  }
  reducedMotion: boolean
}

export default function Blackboard({
  text,
  formula,
  transform,
  reducedMotion,
}: BlackboardProps) {
  if (transform) {
    return (
      <div className="blackboard">
        <motion.div
          className="board-line"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: reducedMotion ? 0 : -24 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: 'easeIn' }}
        >
          <MotionFormulaBlock formula={transform.fromFormula} />
        </motion.div>
        <motion.div
          className="board-line"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            delay: reducedMotion ? 0 : 0.35,
            ease: 'easeOut',
          }}
        >
          <MotionFormulaBlock formula={transform.toFormula} />
        </motion.div>
        {transform.changedTokens && transform.changedTokens.length > 0 && (
          <motion.div
            className="changed-tokens"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reducedMotion ? 0 : 0.8 }}
          >
            变化点：{transform.changedTokens.join('，')}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="blackboard">
      {text && <p className="board-text">{text}</p>}
      {formula && <MotionFormulaBlock formula={formula} />}
    </div>
  )
}

import { motion } from 'motion/react'

interface ChoiceEliminationProps {
  choices: string[]
  eliminated?: string[]
  targetChoice?: string
  reducedMotion: boolean
}

export default function ChoiceElimination({
  choices,
  eliminated = [],
  targetChoice,
  reducedMotion,
}: ChoiceEliminationProps) {
  return (
    <div className="choice-grid">
      {choices.map((choice, index) => {
        const letter = choice.charAt(0)
        const isEliminated = eliminated.includes(letter) || eliminated.includes(choice)
        const isTarget = targetChoice && (letter === targetChoice || choice.startsWith(targetChoice))

        return (
          <motion.div
            key={index}
            className={`choice-card ${isEliminated ? 'eliminated' : ''} ${isTarget ? 'target' : ''}`}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              delay: reducedMotion ? 0 : index * 0.12,
            }}
          >
            <span className="choice-letter">{letter}</span>
            <span className="choice-text">{choice.slice(2)}</span>
            {isEliminated && (
              <motion.div
                className="strike-line"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
              />
            )}
            {isTarget && <div className="target-badge">✓ 答案</div>}
          </motion.div>
        )
      })}
    </div>
  )
}

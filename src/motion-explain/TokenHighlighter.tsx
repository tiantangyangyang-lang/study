import { motion } from 'motion/react'
import RenderedFormula from './RenderedFormula'
import type { FormulaObject } from './types'

interface TokenHighlighterProps {
  formula?: FormulaObject
  tokens: string[]
  style?: 'box' | 'underline' | 'highlight' | 'pulse'
  reducedMotion: boolean
}

export default function TokenHighlighter({
  formula,
  tokens,
  style = 'box',
  reducedMotion,
}: TokenHighlighterProps) {
  const className = `token-highlighter style-${style}`

  return (
    <div className={className}>
      {formula && <RenderedFormula formula={formula} showReadable={false} />}
      <div className="token-list">
        {tokens.map((token, index) => (
          <motion.span
            key={index}
            className="highlight-token"
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              delay: reducedMotion ? 0 : index * 0.18,
            }}
          >
            {token}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

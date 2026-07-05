import { motion } from 'motion/react'
import RenderedFormula from './RenderedFormula'
import type { FormulaObject } from './types'

interface FormulaTransformProps {
  fromFormula: FormulaObject
  toFormula: FormulaObject
  changedTokens?: string[]
  reducedMotion: boolean
}

export default function FormulaTransform({
  fromFormula,
  toFormula,
  changedTokens,
  reducedMotion,
}: FormulaTransformProps) {
  return (
    <div className="formula-transform">
      <motion.div
        className="transform-step"
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 0.35, x: reducedMotion ? 0 : -20 }}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease: 'easeInOut' }}
      >
        <div className="transform-label">原式</div>
        <RenderedFormula formula={fromFormula} showReadable={false} />
      </motion.div>

      <motion.div
        className="transform-arrow"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.25 }}
        style={{ originX: 0 }}
      >
        ↓ 变形
      </motion.div>

      <motion.div
        className="transform-step"
        initial={{ opacity: 0, x: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.5,
          delay: reducedMotion ? 0 : 0.55,
          ease: 'easeOut',
        }}
      >
        <div className="transform-label">变形后</div>
        <RenderedFormula formula={toFormula} showReadable={false} />
      </motion.div>

      {changedTokens && changedTokens.length > 0 && (
        <motion.div
          className="changed-tokens"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reducedMotion ? 0 : 1 }}
        >
          关键变化：
          {changedTokens.map((token, index) => (
            <span key={index} className="changed-token">
              {token}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  )
}

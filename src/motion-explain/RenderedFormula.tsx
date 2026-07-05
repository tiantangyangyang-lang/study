import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import katex from 'katex'
import type { FormulaObject } from './types'

interface RenderedFormulaProps {
  formula: FormulaObject
  showReadable?: boolean
  animate?: boolean
}

export default function RenderedFormula({
  formula,
  showReadable = true,
  animate = true,
}: RenderedFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    try {
      containerRef.current.innerHTML = katex.renderToString(formula.latex, {
        throwOnError: false,
        displayMode: formula.displayMode,
      })
    } catch (err) {
      containerRef.current.textContent = `公式渲染失败: ${formula.latex}`
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }, [formula])

  return (
    <motion.div
      className={`rendered-formula ${formula.displayMode ? 'display' : 'inline'}`}
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div
        ref={containerRef}
        className="formula-render-area"
        aria-label={`数学公式: ${formula.readable}`}
      />
      {showReadable && formula.readable && (
        <div className="formula-readable">{formula.readable}</div>
      )}
    </motion.div>
  )
}

import { AnimatePresence, motion } from 'motion/react'
import RenderedFormula from './RenderedFormula'
import type { FormulaObject } from './types'

interface FormulaGalleryProps {
  formulas: FormulaObject[]
  highlightIds?: string[]
}

export default function FormulaGallery({ formulas, highlightIds = [] }: FormulaGalleryProps) {
  if (formulas.length === 0) return null

  return (
    <div className="formula-gallery">
      <AnimatePresence mode="popLayout">
        {formulas.map((formula) => (
          <motion.div
            key={formula.id}
            layout
            className={`gallery-item ${highlightIds.includes(formula.id) ? 'highlight' : ''}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
          >
            <RenderedFormula formula={formula} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

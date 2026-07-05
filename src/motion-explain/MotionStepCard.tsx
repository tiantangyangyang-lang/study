import { motion } from 'motion/react'
import MotionFormulaBlock from './MotionFormulaBlock'
import type { MotionStep } from './types'

interface MotionStepCardProps {
  step: MotionStep
  stepIndex: number
  totalSteps: number
  reducedMotion: boolean
}

const typeLabels: Record<MotionStep['type'], string> = {
  intro: '引入题目',
  show_question: '题干',
  show_formula: '展示公式',
  transform_formula: '公式变形',
  highlight: '高亮关键',
  explanation_text: '文字说明',
  choice_elimination: '排除选项',
  conclusion: '结论',
}

export default function MotionStepCard({
  step,
  stepIndex,
  totalSteps,
  reducedMotion,
}: MotionStepCardProps) {
  return (
    <motion.div
      key={step.id}
      className="card"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -16 }}
      transition={
        reducedMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }
      }
      role="region"
      aria-label={`步骤 ${stepIndex + 1} / ${totalSteps}`}
    >
      <div className="card-header">
        <h3 className="card-title">
          {stepIndex + 1}. {typeLabels[step.type] ?? step.type}
        </h3>
        <span className="card-step-id">{step.id}</span>
      </div>
      <p className="card-narration">{step.narration}</p>
      {step.formula && <MotionFormulaBlock formula={step.formula} />}
      {step.reviewStatus === 'needs_human_review' && (
        <div className="badge badge-review" style={{ marginTop: '1rem' }}>
          待人工核对
        </div>
      )}
    </motion.div>
  )
}

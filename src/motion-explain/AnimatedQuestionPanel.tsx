import { motion } from 'motion/react'
import MathMarkdown from './MathMarkdown'
import FormulaGallery from './FormulaGallery'
import type { MotionExplanationJSON } from './types'

interface AnimatedQuestionPanelProps {
  explanation: MotionExplanationJSON
  currentStepIndex: number
  reducedMotion: boolean
}

const visibleTypes = new Set([
  'show_question',
  'condition_extract',
  'formula_reveal',
  'equation_transform',
  'token_highlight',
  'graph_explain',
  'table_explain',
  'matrix_explain',
  'choice_elimination',
  'common_mistake',
  'explanation_text',
  'conclusion_reveal',
])

export default function AnimatedQuestionPanel({
  explanation,
  currentStepIndex,
  reducedMotion,
}: AnimatedQuestionPanelProps) {
  const steps = explanation.explanation.steps
  const currentStep = steps[currentStepIndex]

  const questionVisible = visibleTypes.has(currentStep.type)
  const conclusionRevealed = currentStep.type === 'conclusion_reveal'

  const stepFormulaIds = currentStep.formulas ?? []
  const stepFormulas = explanation.question.formulas.filter((f) =>
    stepFormulaIds.includes(f.id),
  )

  return (
    <div className="question-paper">
      <div className="paper-header">
        {explanation.subject === 'math1' ? '考研数学（一）' : '考研数学（二）'} {explanation.year} · 第 {explanation.questionNo} 题
      </div>

      <motion.div
        className="paper-question"
        initial={{ opacity: 0 }}
        animate={{ opacity: questionVisible ? 1 : 0.25 }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
      >
        <span className="q-number">{explanation.questionNo}.</span>
        <MathMarkdown>{explanation.question.stemMarkdown}</MathMarkdown>
      </motion.div>

      {stepFormulas.length > 0 && (
        <motion.div
          className="paper-conditions"
          initial={{ opacity: 0, x: reducedMotion ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
        >
          <div className="condition-label">本题涉及公式</div>
          <FormulaGallery formulas={stepFormulas} />
        </motion.div>
      )}

      {explanation.question.options && questionVisible && (
        <motion.div
          className="paper-choices"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          {explanation.question.options.map((choice, index) => {
            const letter = choice.charAt(0)
            const isCorrect =
              conclusionRevealed && explanation.answer.value.startsWith(letter)
            return (
              <div
                key={index}
                className={`paper-choice ${isCorrect ? 'correct' : ''}`}
              >
                <span className="paper-choice-letter">{letter}.</span>
                <MathMarkdown>{choice.slice(2)}</MathMarkdown>
              </div>
            )
          })}
        </motion.div>
      )}

      {conclusionRevealed && (
        <motion.div
          className="paper-answer"
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <MathMarkdown>{`答案：${explanation.answer.markdown}`}</MathMarkdown>
        </motion.div>
      )}
    </div>
  )
}

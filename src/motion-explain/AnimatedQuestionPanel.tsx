import { motion } from 'motion/react'
import MotionFormulaBlock from './MotionFormulaBlock'
import type { MotionExplanationJSON } from './types'

interface AnimatedQuestionPanelProps {
  explanation: MotionExplanationJSON
  currentStepIndex: number
  steps: { id: string; type: string; narration: string }[]
  reducedMotion: boolean
}

const typeOrder = [
  'intro',
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
]

export default function AnimatedQuestionPanel({
  explanation,
  currentStepIndex,
  reducedMotion,
}: AnimatedQuestionPanelProps) {
  const stepsBeforeOrAtCurrent = typeOrder.slice(0, typeOrder.indexOf(explanation.steps[currentStepIndex]?.type) + 1)

  const questionRevealed = stepsBeforeOrAtCurrent.includes('show_question')
  const conditionsRevealed = stepsBeforeOrAtCurrent.includes('condition_extract')
  const choicesRevealed = stepsBeforeOrAtCurrent.includes('choice_elimination')
  const conclusionRevealed = stepsBeforeOrAtCurrent.includes('conclusion_reveal')

  return (
    <div className="question-paper">
      <div className="paper-header">
        {explanation.subject === 'math1' ? '考研数学（一）' : '考研数学（二）'} {explanation.year} · 第 {explanation.questionNo} 题
      </div>

      <motion.div
        className="paper-question"
        initial={{ opacity: 0 }}
        animate={{ opacity: questionRevealed ? 1 : 0.2 }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
      >
        <span className="q-number">{explanation.questionNo}.</span>
        {explanation.questionText}
      </motion.div>

      {conditionsRevealed && explanation.steps[currentStepIndex]?.formula && (
        <motion.div
          className="paper-conditions"
          initial={{ opacity: 0, x: reducedMotion ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
        >
          <div className="condition-label">本题条件 / 关键式</div>
          <MotionFormulaBlock formula={explanation.steps[currentStepIndex].formula ?? ''} />
        </motion.div>
      )}

      {explanation.choices && choicesRevealed && (
        <motion.div
          className="paper-choices"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          {explanation.choices.map((choice, index) => {
            const letter = choice.charAt(0)
            return (
              <div
                key={index}
                className={`paper-choice ${
                  conclusionRevealed && explanation.answer.startsWith(letter) ? 'correct' : ''
                }`}
              >
                <span className="paper-choice-letter">{letter}.</span>
                {choice.slice(2)}
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
          答案：{explanation.answer}
        </motion.div>
      )}
    </div>
  )
}

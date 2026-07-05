import { AnimatePresence, motion } from 'motion/react'
import Blackboard from './Blackboard'
import FormulaTransform from './FormulaTransform'
import TokenHighlighter from './TokenHighlighter'
import ChoiceElimination from './ChoiceElimination'
import MathMarkdown from './MathMarkdown'
import type { MotionExplanationJSON, ExplanationStep, VisualAction, FormulaObject } from './types'

interface MotionStageProps {
  explanation: MotionExplanationJSON
  step: ExplanationStep
  reducedMotion: boolean
}

function getFormulaById(explanation: MotionExplanationJSON, id: string): FormulaObject | null {
  const all = [
    ...explanation.question.formulas,
    ...explanation.answer.formulas,
    ...explanation.explanation.steps.flatMap((s) => s.formulas.map((fid) => {
      const qf = explanation.question.formulas.find((f) => f.id === fid)
      if (qf) return qf
      return null
    }).filter(Boolean) as FormulaObject[]),
  ]
  return all.find((f) => f.id === id) ?? null
}

function renderAction(
  action: VisualAction,
  explanation: MotionExplanationJSON,
  reducedMotion: boolean,
  index: number,
) {
  const baseTransition = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.4,
      delay: reducedMotion ? 0 : index * 0.12,
    },
  }

  switch (action.kind) {
    case 'fade_in_question':
      return (
        <motion.div
          key={index}
          className="stage-line"
          {...baseTransition}
        >
          <MathMarkdown>{explanation.question.stemMarkdown}</MathMarkdown>
        </motion.div>
      )
    case 'write_text':
      return (
        <motion.div key={index} className="stage-line" {...baseTransition}>
          {action.text}
        </motion.div>
      )
    case 'show_readable_explanation':
      return (
        <motion.div key={index} className="stage-readable" {...baseTransition}>
          {action.text}
        </motion.div>
      )
    case 'write_formula': {
      const wf = action.formulaId ? getFormulaById(explanation, action.formulaId) : null
      return wf ? (
        <motion.div key={index} className="stage-formula" {...baseTransition}>
          <Blackboard formula={wf} reducedMotion={reducedMotion} />
        </motion.div>
      ) : null
    }
    case 'transform_formula': {
      const fromF = action.fromFormulaId ? getFormulaById(explanation, action.fromFormulaId) : null
      const toF = action.toFormulaId ? getFormulaById(explanation, action.toFormulaId) : null
      if (!fromF || !toF) return null
      return (
        <FormulaTransform
          key={index}
          fromFormula={fromF}
          toFormula={toF}
          changedTokens={action.changedTokens}
          reducedMotion={reducedMotion}
        />
      )
    }
    case 'highlight_formula_tokens': {
      const hf = action.formulaId ? getFormulaById(explanation, action.formulaId) : null
      return (
        <TokenHighlighter
          key={index}
          formula={hf ?? undefined}
          tokens={action.tokens ?? []}
          style={(action.style as 'box' | 'underline' | 'highlight' | 'pulse') ?? 'box'}
          reducedMotion={reducedMotion}
        />
      )
    }
    case 'highlight_question_keywords':
      return (
        <motion.div key={index} className="stage-keywords" {...baseTransition}>
          关键词：
          {action.keywords?.map((kw, i) => (
            <span key={i} className="keyword-tag">{kw}</span>
          ))}
        </motion.div>
      )
    case 'eliminate_choice':
      return (
        <ChoiceElimination
          key={index}
          choices={action.choices ?? explanation.question.options ?? []}
          eliminated={
            action.targetChoice && action.targetChoice !== 'TODO'
              ? (action.choices ?? explanation.question.options ?? [])
                  .map((c) => c.charAt(0))
                  .filter((letter) => letter !== action.targetChoice)
              : []
          }
          targetChoice={action.targetChoice}
          reducedMotion={reducedMotion}
        />
      )
    case 'reveal_conclusion':
      return (
        <motion.div
          key={index}
          className="reveal-answer"
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <div className="reveal-badge">最终答案</div>
          <div className="reveal-text">
            <MathMarkdown>{explanation.answer.markdown}</MathMarkdown>
          </div>
        </motion.div>
      )
    case 'show_table':
      return (
        <motion.div key={index} {...baseTransition} className="stage-table-wrap">
          <table className="stage-table">
            <tbody>
              {action.cells?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}><MathMarkdown>{cell}</MathMarkdown></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )
    case 'show_matrix':
      return (
        <motion.div key={index} {...baseTransition} className="stage-matrix-wrap">
          <div className="matrix-bracket">
            {action.cells?.map((row, rowIndex) => (
              <div key={rowIndex} className="matrix-row">
                {row.map((cell, cellIndex) => (
                  <div key={cellIndex} className="matrix-cell">
                    <MathMarkdown>{cell}</MathMarkdown>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )
    default:
      return null
  }
}

export default function MotionStage({ explanation, step, reducedMotion }: MotionStageProps) {
  const layout = step.visual?.layout ?? 'blackboard'
  const actions = step.visual?.actions ?? []

  return (
    <div className={`motion-stage layout-${layout}`}>
      <div className="stage-board">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step.id}
            className="stage-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
          >
            {actions.map((action, index) =>
              renderAction(action, explanation, reducedMotion, index),
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

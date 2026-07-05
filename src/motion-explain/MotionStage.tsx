import { motion, AnimatePresence } from 'motion/react'
import Blackboard from './Blackboard'
import FormulaTransform from './FormulaTransform'
import TokenHighlighter from './TokenHighlighter'
import ChoiceElimination from './ChoiceElimination'
import type { MotionStep, VisualAction } from './types'

interface MotionStageProps {
  step: MotionStep
  reducedMotion: boolean
}

function renderAction(action: VisualAction, reducedMotion: boolean, index: number) {
  const baseTransition = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.4,
      delay: reducedMotion ? 0 : index * 0.12,
    },
  }

  switch (action.kind) {
    case 'write_text':
      return (
        <motion.div key={index} {...baseTransition} className="stage-line">
          {action.text}
        </motion.div>
      )
    case 'write_formula':
      return (
        <motion.div key={index} {...baseTransition} className="stage-formula">
          <Blackboard formula={action.formula} reducedMotion={reducedMotion} />
        </motion.div>
      )
    case 'transform_formula':
      return (
        <FormulaTransform
          key={index}
          fromFormula={action.fromFormula ?? ''}
          toFormula={action.toFormula ?? ''}
          changedTokens={action.changedTokens}
          reducedMotion={reducedMotion}
        />
      )
    case 'highlight_tokens':
      return (
        <TokenHighlighter
          key={index}
          formula={action.formula}
          tokens={action.tokens ?? []}
          style={action.style ?? 'box'}
          reducedMotion={reducedMotion}
        />
      )
    case 'eliminate_choice': {
      const choices = action.choices ?? []
      return (
        <ChoiceElimination
          key={index}
          choices={choices}
          eliminated={
            action.targetChoice && action.targetChoice !== 'TODO'
              ? choices
                  .map((c) => c.charAt(0))
                  .filter((letter) => letter !== action.targetChoice)
              : []
          }
          targetChoice={action.targetChoice}
          reducedMotion={reducedMotion}
        />
      )
    }
    case 'reveal_answer':
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
          <div className="reveal-text">{action.text}</div>
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
                    <td key={cellIndex}>{cell}</td>
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
                  <div key={cellIndex} className="matrix-cell">{cell}</div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )
    case 'draw_axis':
      return (
        <motion.div key={index} {...baseTransition} className="axis-placeholder">
          坐标轴图示占位（需人工补充具体函数图像）
        </motion.div>
      )
    case 'plot_curve':
      return (
        <motion.div key={index} {...baseTransition} className="curve-placeholder">
          函数曲线图示占位（需人工补充具体曲线）
        </motion.div>
      )
    case 'box_region':
      return (
        <motion.div
          key={index}
          className="box-region"
          style={{
            left: action.region?.x,
            top: action.region?.y,
            width: action.region?.width,
            height: action.region?.height,
            borderColor: action.color,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
        >
          {action.text}
        </motion.div>
      )
    default:
      return null
  }
}

export default function MotionStage({ step, reducedMotion }: MotionStageProps) {
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
            {actions.length > 0 ? (
              actions.map((action, index) => renderAction(action, reducedMotion, index))
            ) : (
              <Blackboard
                text={step.narration}
                formula={step.formula ?? undefined}
                reducedMotion={reducedMotion}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

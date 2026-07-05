import type { ExplanationStep } from './types'

interface MotionTimelineProps {
  steps: ExplanationStep[]
  currentIndex: number
  onSelect: (index: number) => void
}

const typeLabels: Record<ExplanationStep['type'], string> = {
  show_question: '题干',
  condition_extract: '条件',
  formula_reveal: '公式',
  equation_transform: '变形',
  token_highlight: '高亮',
  graph_explain: '图像',
  table_explain: '表格',
  matrix_explain: '矩阵',
  choice_elimination: '排除',
  common_mistake: '易错',
  explanation_text: '说明',
  conclusion_reveal: '结论',
}

export default function MotionTimeline({
  steps,
  currentIndex,
  onSelect,
}: MotionTimelineProps) {
  return (
    <ol className="step-list" aria-label="步骤时间轴">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`step-item ${index === currentIndex ? 'active' : ''}`}
          onClick={() => onSelect(index)}
          aria-current={index === currentIndex ? 'step' : undefined}
        >
          <span className="step-number">{index + 1}</span>
          <div>
            <div className="step-type">{typeLabels[step.type] ?? step.type}</div>
            <div>{step.narrationMarkdown.slice(0, 40)}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

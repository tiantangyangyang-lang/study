import type { MotionStep } from './types'

interface MotionTimelineProps {
  steps: MotionStep[]
  currentIndex: number
  onSelect: (index: number) => void
}

const typeLabels: Record<MotionStep['type'], string> = {
  intro: '引入',
  show_question: '题干',
  show_formula: '公式',
  transform_formula: '变形',
  highlight: '高亮',
  explanation_text: '说明',
  choice_elimination: '排除',
  conclusion: '结论',
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
            <div>{step.narration.slice(0, 40)}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

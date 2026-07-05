import { useEffect, useRef } from 'react'
import katex from 'katex'

interface MotionFormulaBlockProps {
  formula: string
  displayMode?: boolean
}

export default function MotionFormulaBlock({
  formula,
  displayMode = true,
}: MotionFormulaBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    try {
      containerRef.current.innerHTML = katex.renderToString(formula, {
        throwOnError: false,
        displayMode,
      })
    } catch (err) {
      containerRef.current.textContent = `公式渲染失败: ${formula}`
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }, [formula, displayMode])

  return (
    <div
      className="formula-block"
      ref={containerRef}
      aria-label={`数学公式: ${formula}`}
    />
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import MotionStepCard from './MotionStepCard'
import MotionTimeline from './MotionTimeline'
import type { MotionExplanationJSON } from './types'

interface MotionExplainPlayerProps {
  explanation: MotionExplanationJSON
}

export default function MotionExplainPlayer({
  explanation,
}: MotionExplainPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    const listener = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  const currentStep = explanation.steps[currentIndex]
  const totalSteps = explanation.steps.length
  const progress =
    totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const goToStep = useCallback(
    (index: number) => {
      clearTimer()
      const clamped = Math.max(0, Math.min(index, totalSteps - 1))
      setCurrentIndex(clamped)
      if (isAutoPlaying) {
        setIsPlaying(true)
      }
    },
    [clearTimer, totalSteps, isAutoPlaying],
  )

  const next = useCallback(() => {
    if (currentIndex < totalSteps - 1) {
      goToStep(currentIndex + 1)
    } else {
      setIsPlaying(false)
      setIsAutoPlaying(false)
    }
  }, [currentIndex, totalSteps, goToStep])

  const prev = useCallback(() => {
    goToStep(currentIndex - 1)
  }, [currentIndex, goToStep])

  const replay = useCallback(() => {
    setIsAutoPlaying(false)
    setIsPlaying(false)
    goToStep(0)
  }, [goToStep])

  const togglePlay = useCallback(() => {
    setIsPlaying((previous) => !previous)
  }, [])

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((previous) => {
      const nextState = !previous
      setIsPlaying(nextState)
      return nextState
    })
  }, [])

  useEffect(() => {
    if (!isPlaying || !currentStep) {
      clearTimer()
      return
    }

    const duration = reducedMotion ? 0 : currentStep.durationMs
    const effectiveDuration = Math.max(duration, 500)

    timerRef.current = setTimeout(() => {
      if (currentIndex < totalSteps - 1) {
        setCurrentIndex((idx) => idx + 1)
      } else {
        setIsPlaying(false)
        setIsAutoPlaying(false)
      }
    }, effectiveDuration)

    return clearTimer
  }, [
    isPlaying,
    currentStep,
    currentIndex,
    totalSteps,
    reducedMotion,
    clearTimer,
  ])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const statusText = useMemo(() => {
    return `步骤 ${currentIndex + 1} / ${totalSteps}`
  }, [currentIndex, totalSteps])

  if (!currentStep) {
    return <div className="panel">没有可播放的步骤</div>
  }

  return (
    <div className="player">
      <aside className="panel">
        <h2>题目信息</h2>
        <ul className="info-list">
          <li>
            <span className="label">标题：</span>
            {explanation.title}
          </li>
          <li>
            <span className="label">科目：</span>
            {explanation.subject} / {explanation.year} / 第 {explanation.questionNo} 题
          </li>
          <li>
            <span className="label">题干：</span>
            {explanation.questionText}
          </li>
          <li>
            <span className="label">答案：</span>
            {explanation.answer}
          </li>
          <li>
            <span className="label">预计时长：</span>
            {explanation.estimatedDurationMs / 1000}s
          </li>
          <li>
            <span className="label">审核状态：</span>
            <span className="badge badge-review">{explanation.reviewStatus}</span>
          </li>
          <li>
            <span className="label">最终状态：</span>
            <span className="badge badge-blocked">{explanation.finalizationStatus}</span>
          </li>
          <li>
            <span className="label">来源：</span>
            {explanation.source.type} / {explanation.source.path}
          </li>
        </ul>

        <h2 style={{ marginTop: '1.5rem' }}>步骤时间轴</h2>
        <MotionTimeline
          steps={explanation.steps}
          currentIndex={currentIndex}
          onSelect={goToStep}
        />
      </aside>

      <section className="panel stage">
        <AnimatePresence mode="wait" initial={false}>
          <MotionStepCard
            key={currentStep.id}
            step={currentStep}
            stepIndex={currentIndex}
            totalSteps={totalSteps}
            reducedMotion={reducedMotion}
          />
        </AnimatePresence>
      </section>

      <div className="controls">
        <button
          className="control-btn"
          onClick={prev}
          disabled={currentIndex === 0}
          aria-label="上一步"
        >
          上一步
        </button>
        <button
          className={`control-btn ${isPlaying ? '' : 'primary'}`}
          onClick={togglePlay}
          aria-label={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button
          className={`control-btn ${isAutoPlaying ? 'primary' : ''}`}
          onClick={toggleAutoPlay}
          aria-label="自动播放"
        >
          {isAutoPlaying ? '停止自动' : '自动播放'}
        </button>
        <button
          className="control-btn"
          onClick={next}
          disabled={currentIndex === totalSteps - 1}
          aria-label="下一步"
        >
          下一步
        </button>
        <button
          className="control-btn"
          onClick={replay}
          aria-label="重播"
        >
          重播
        </button>
        <div className="progress" aria-hidden="true">
          <motion.div
            className="progress-bar"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
          />
        </div>
        <span className="status-text">{statusText}</span>
      </div>
    </div>
  )
}

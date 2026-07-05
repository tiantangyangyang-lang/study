export type StepType =
  | 'intro'
  | 'show_question'
  | 'show_formula'
  | 'transform_formula'
  | 'highlight'
  | 'explanation_text'
  | 'choice_elimination'
  | 'conclusion'

export type ReviewStatus = 'needs_human_review' | 'verified' | 'rejected'
export type FinalizationStatus = 'blocked' | 'ready' | 'imported'

export interface MotionStep {
  id: string
  type: StepType
  narration: string
  formula: string | null
  durationMs: number
  reviewStatus: ReviewStatus
}

export interface MotionExplanationJSON {
  schemaVersion: string
  subject: string
  year: number
  questionNo: number
  source: {
    type: string
    path: string
    status: ReviewStatus
  }
  title: string
  questionText: string
  answer: string
  reviewStatus: ReviewStatus
  finalizationStatus: FinalizationStatus
  estimatedDurationMs: number
  steps: MotionStep[]
}

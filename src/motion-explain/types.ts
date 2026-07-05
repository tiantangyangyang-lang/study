export type StepType =
  | 'intro'
  | 'show_question'
  | 'condition_extract'
  | 'formula_reveal'
  | 'equation_transform'
  | 'token_highlight'
  | 'graph_explain'
  | 'table_explain'
  | 'matrix_explain'
  | 'choice_elimination'
  | 'common_mistake'
  | 'explanation_text'
  | 'conclusion_reveal'

export type ActionKind =
  | 'write_text'
  | 'write_formula'
  | 'transform_formula'
  | 'highlight_tokens'
  | 'fade_in'
  | 'fade_out'
  | 'move_to_board'
  | 'box_region'
  | 'underline'
  | 'reveal_answer'
  | 'eliminate_choice'
  | 'draw_axis'
  | 'plot_curve'
  | 'show_table'
  | 'show_matrix'

export type ReviewStatus = 'needs_human_review' | 'verified' | 'rejected'
export type FinalizationStatus = 'blocked' | 'ready' | 'imported'

export interface VisualAction {
  kind: ActionKind
  target?: string
  text?: string
  formula?: string
  fromFormula?: string
  toFormula?: string
  changedTokens?: string[]
  tokens?: string[]
  token?: string
  style?: 'box' | 'underline' | 'highlight' | 'pulse' | 'strike'
  region?: {
    x: number
    y: number
    width: number
    height: number
  }
  choices?: string[]
  targetChoice?: string
  columns?: number
  rows?: number
  cells?: string[][]
  color?: string
  durationMs?: number
}

export interface Visual {
  layout: 'blackboard' | 'split' | 'question' | 'graph' | 'table' | 'matrix'
  actions: VisualAction[]
}

export interface MotionStep {
  id: string
  type: StepType
  narration: string
  formula: string | null
  durationMs: number
  reviewStatus: ReviewStatus
  visual?: Visual
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
  choices?: string[]
  reviewStatus: ReviewStatus
  finalizationStatus: FinalizationStatus
  estimatedDurationMs: number
  steps: MotionStep[]
}

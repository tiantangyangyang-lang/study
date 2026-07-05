export type StepType =
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
  | 'fade_in_question'
  | 'write_formula'
  | 'transform_formula'
  | 'highlight_formula_tokens'
  | 'highlight_question_keywords'
  | 'eliminate_choice'
  | 'reveal_conclusion'
  | 'show_readable_explanation'
  | 'write_text'
  | 'show_table'
  | 'show_matrix'

export type ReviewStatus = 'needs_human_review' | 'verified' | 'rejected'
export type FinalizationStatus = 'blocked' | 'ready' | 'imported'

export interface FormulaObject {
  id: string
  latex: string
  displayMode: boolean
  readable: string
  role: 'question' | 'answer' | 'derivation' | 'explanation' | 'conclusion'
}

export interface VisualAction {
  kind: ActionKind
  target?: string
  text?: string
  formulaId?: string
  fromFormulaId?: string
  toFormulaId?: string
  changedTokens?: string[]
  tokens?: string[]
  keywords?: string[]
  style?: 'box' | 'underline' | 'highlight' | 'pulse' | 'strike'
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

export interface ExplanationStep {
  id: string
  type: StepType
  narrationMarkdown: string
  durationMs: number
  formulas: string[]
  visual: Visual
  reviewStatus: ReviewStatus
}

export interface QuestionBlock {
  stemMarkdown: string
  options?: string[]
  formulas: FormulaObject[]
}

export interface AnswerBlock {
  value: string
  markdown: string
  formulas: FormulaObject[]
}

export interface ExplanationBlock {
  summaryMarkdown: string
  steps: ExplanationStep[]
}

export interface RenderingConfig {
  mathRenderer: 'katex'
  markdownMath: boolean
  supportsDisplayMath: boolean
  supportsInlineMath: boolean
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
  reviewStatus: ReviewStatus
  finalizationStatus: FinalizationStatus
  question: QuestionBlock
  answer: AnswerBlock
  explanation: ExplanationBlock
  rendering: RenderingConfig
}

import { z } from 'zod'

const stepTypes = [
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
] as const

const actionKinds = [
  'fade_in_question',
  'write_formula',
  'transform_formula',
  'highlight_formula_tokens',
  'highlight_question_keywords',
  'eliminate_choice',
  'reveal_conclusion',
  'show_readable_explanation',
  'write_text',
  'show_table',
  'show_matrix',
] as const

const reviewStatus = ['needs_human_review', 'verified', 'rejected'] as const
const finalizationStatus = ['blocked', 'ready', 'imported'] as const

export const formulaObjectSchema = z.object({
  id: z.string().min(1),
  latex: z.string().min(1),
  displayMode: z.boolean(),
  readable: z.string().min(1),
  role: z.enum(['question', 'answer', 'derivation', 'explanation', 'conclusion']),
})

const visualActionSchema = z.object({
  kind: z.enum(actionKinds),
  target: z.string().optional(),
  text: z.string().optional(),
  formulaId: z.string().optional(),
  fromFormulaId: z.string().optional(),
  toFormulaId: z.string().optional(),
  changedTokens: z.array(z.string()).optional(),
  tokens: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  choices: z.array(z.string()).optional(),
  targetChoice: z.string().optional(),
  columns: z.number().int().positive().optional(),
  rows: z.number().int().positive().optional(),
  cells: z.array(z.array(z.string())).optional(),
  color: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
})

const visualSchema = z.object({
  layout: z.enum(['blackboard', 'split', 'question', 'graph', 'table', 'matrix']),
  actions: z.array(visualActionSchema),
})

export const explanationStepSchema = z.object({
  id: z.string().min(1),
  type: z.enum(stepTypes),
  narrationMarkdown: z.string(),
  durationMs: z.number().int().nonnegative(),
  formulas: z.array(z.string()),
  visual: visualSchema,
  reviewStatus: z.enum(reviewStatus),
})

export const motionExplanationSchema = z.object({
  schemaVersion: z.literal('motion-explanation-v1'),
  subject: z.enum(['math1', 'math2']),
  year: z.number().int().min(1980).max(2100),
  questionNo: z.number().int().positive(),
  source: z.object({
    type: z.literal('markdown'),
    path: z.string().regex(/\.(md|markdown)$/i, {
      message: 'source.path 必须指向 .md 或 .markdown 文件',
    }),
    status: z.enum(reviewStatus),
  }),
  reviewStatus: z.enum(reviewStatus),
  finalizationStatus: z.enum(finalizationStatus),
  question: z.object({
    stemMarkdown: z.string(),
    options: z.array(z.string()).optional(),
    formulas: z.array(formulaObjectSchema),
  }),
  answer: z.object({
    value: z.string(),
    markdown: z.string(),
    formulas: z.array(formulaObjectSchema),
  }),
  explanation: z.object({
    summaryMarkdown: z.string(),
    steps: z.array(explanationStepSchema).min(1),
  }),
  rendering: z.object({
    mathRenderer: z.literal('katex'),
    markdownMath: z.boolean(),
    supportsDisplayMath: z.boolean(),
    supportsInlineMath: z.boolean(),
  }),
})

export type MotionExplanationSchema = z.infer<typeof motionExplanationSchema>

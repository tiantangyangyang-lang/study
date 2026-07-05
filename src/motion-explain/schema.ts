import { z } from 'zod'

const stepTypes = [
  'intro',
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
  'write_text',
  'write_formula',
  'transform_formula',
  'highlight_tokens',
  'fade_in',
  'fade_out',
  'move_to_board',
  'box_region',
  'underline',
  'reveal_answer',
  'eliminate_choice',
  'draw_axis',
  'plot_curve',
  'show_table',
  'show_matrix',
] as const

const reviewStatus = ['needs_human_review', 'verified', 'rejected'] as const
const finalizationStatus = ['blocked', 'ready', 'imported'] as const

const visualActionSchema = z.object({
  kind: z.enum(actionKinds),
  target: z.string().optional(),
  text: z.string().optional(),
  formula: z.string().optional(),
  fromFormula: z.string().optional(),
  toFormula: z.string().optional(),
  changedTokens: z.array(z.string()).optional(),
  tokens: z.array(z.string()).optional(),
  token: z.string().optional(),
  style: z.enum(['box', 'underline', 'highlight', 'pulse', 'strike']).optional(),
  region: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
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

export const motionStepSchema = z.object({
  id: z.string().min(1),
  type: z.enum(stepTypes),
  narration: z.string(),
  formula: z.string().nullable(),
  durationMs: z.number().int().nonnegative(),
  reviewStatus: z.enum(reviewStatus),
  visual: visualSchema.optional(),
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
  title: z.string().min(1),
  questionText: z.string(),
  answer: z.string(),
  choices: z.array(z.string()).optional(),
  reviewStatus: z.enum(reviewStatus),
  finalizationStatus: z.enum(finalizationStatus),
  estimatedDurationMs: z.number().int().nonnegative(),
  steps: z.array(motionStepSchema).min(1),
})

export type MotionExplanationSchema = z.infer<typeof motionExplanationSchema>

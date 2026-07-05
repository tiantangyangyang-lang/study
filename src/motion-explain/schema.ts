import { z } from 'zod'

const stepTypes = [
  'intro',
  'show_question',
  'show_formula',
  'transform_formula',
  'highlight',
  'explanation_text',
  'choice_elimination',
  'conclusion',
] as const

const reviewStatus = ['needs_human_review', 'verified', 'rejected'] as const
const finalizationStatus = ['blocked', 'ready', 'imported'] as const

export const motionStepSchema = z.object({
  id: z.string().min(1),
  type: z.enum(stepTypes),
  narration: z.string(),
  formula: z.string().nullable(),
  durationMs: z.number().int().nonnegative(),
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
  title: z.string().min(1),
  questionText: z.string(),
  answer: z.string(),
  reviewStatus: z.enum(reviewStatus),
  finalizationStatus: z.enum(finalizationStatus),
  estimatedDurationMs: z.number().int().nonnegative(),
  steps: z.array(motionStepSchema).min(1),
})

export type MotionExplanationSchema = z.infer<typeof motionExplanationSchema>

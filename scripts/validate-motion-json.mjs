import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')

const STEP_TYPES = new Set([
  'intro',
  'show_question',
  'show_formula',
  'transform_formula',
  'highlight',
  'explanation_text',
  'choice_elimination',
  'conclusion',
])

const REVIEW_STATUS = new Set(['needs_human_review', 'verified', 'rejected'])
const FINALIZATION_STATUS = new Set(['blocked', 'ready', 'imported'])
const VALID_SUBJECTS = new Set(['math1', 'math2'])

const FORBIDDEN = [
  '<script',
  'javascript:',
  'function',
  '=>',
  'import',
  'export',
  'eval(',
  'new Function',
]

async function listMotionJson(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.motion.json'))
      .map((entry) => join(dir, entry.name))
  } catch {
    return []
  }
}

function relativePath(file) {
  return file.startsWith(root) ? file.slice(root.length + 1) : file
}

function validateStep(step, index) {
  const errors = []
  const prefix = `steps[${index}]`

  if (!step || typeof step !== 'object') {
    return [`${prefix} 必须是对象`]
  }

  if (typeof step.id !== 'string' || step.id.length === 0) {
    errors.push(`${prefix}.id 必须是非空字符串`)
  }

  if (!STEP_TYPES.has(step.type)) {
    errors.push(`${prefix}.type 必须是允许的 step type 之一`)
  }

  if (typeof step.narration !== 'string') {
    errors.push(`${prefix}.narration 必须是字符串`)
  }

  if (step.formula !== null && typeof step.formula !== 'string') {
    errors.push(`${prefix}.formula 必须是字符串或 null`)
  }

  if (!Number.isInteger(step.durationMs) || step.durationMs < 0) {
    errors.push(`${prefix}.durationMs 必须是非负整数`)
  }

  if (!REVIEW_STATUS.has(step.reviewStatus)) {
    errors.push(`${prefix}.reviewStatus 必须是合法 review status`)
  }

  return errors
}

function validateFile(parsed) {
  const errors = []

  if (parsed.schemaVersion !== 'motion-explanation-v1') {
    errors.push('schemaVersion 必须是 motion-explanation-v1')
  }

  if (!VALID_SUBJECTS.has(parsed.subject)) {
    errors.push(`subject 必须是 math1 或 math2（当前: ${parsed.subject}）`)
  }

  if (!Number.isInteger(parsed.year) || parsed.year < 1980 || parsed.year > 2100) {
    errors.push('year 必须是 1980-2100 之间的整数')
  }

  if (!Number.isInteger(parsed.questionNo) || parsed.questionNo < 1) {
    errors.push('questionNo 必须是正整数')
  }

  if (!parsed.source || typeof parsed.source !== 'object') {
    errors.push('source 必须是对象')
  } else {
    if (parsed.source.type !== 'markdown') {
      errors.push(`source.type 必须是 markdown（当前: ${parsed.source.type}）`)
    }

    if (typeof parsed.source.path !== 'string') {
      errors.push('source.path 必须是字符串')
    } else {
      const lower = parsed.source.path.toLowerCase()
      if (!lower.endsWith('.md') && !lower.endsWith('.markdown')) {
        errors.push('source.path 必须指向 .md 或 .markdown 文件')
      }
      if (lower.endsWith('.pdf')) {
        errors.push('source.path 禁止指向 PDF 文件')
      }
    }

    if (!REVIEW_STATUS.has(parsed.source.status)) {
      errors.push('source.status 必须是合法 review status')
    }
  }

  if (typeof parsed.title !== 'string' || parsed.title.length === 0) {
    errors.push('title 必须是非空字符串')
  }

  if (typeof parsed.questionText !== 'string') {
    errors.push('questionText 必须是字符串')
  }

  if (typeof parsed.answer !== 'string') {
    errors.push('answer 必须是字符串')
  }

  if (parsed.reviewStatus !== 'needs_human_review') {
    errors.push(`reviewStatus 必须是 needs_human_review（当前: ${parsed.reviewStatus}）`)
  }

  if (parsed.finalizationStatus !== 'blocked') {
    errors.push(`finalizationStatus 必须是 blocked（当前: ${parsed.finalizationStatus}）`)
  }

  if (!Number.isInteger(parsed.estimatedDurationMs) || parsed.estimatedDurationMs < 0) {
    errors.push('estimatedDurationMs 必须是非负整数')
  }

  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    errors.push('steps 必须是非空数组')
  } else {
    for (let i = 0; i < parsed.steps.length; i++) {
      errors.push(...validateStep(parsed.steps[i], i))
    }
  }

  return errors
}

function checkForbiddenWords(raw, basename) {
  const errors = []
  for (const pattern of FORBIDDEN) {
    if (raw.includes(pattern)) {
      errors.push(`${basename} 包含禁用词: "${pattern}"`)
    }
  }
  return errors
}

async function main() {
  const dataDir = join(root, 'src', 'data')
  const exportsDir = join(root, 'exports', 'motion-json')
  const files = [
    ...(await listMotionJson(dataDir)),
    ...(await listMotionJson(exportsDir)),
  ]

  if (files.length === 0) {
    console.error('错误：未找到任何 *.motion.json 文件。')
    process.exit(1)
  }

  let totalErrors = 0
  const summary = []

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const basename = relativePath(file)

    const forbiddenErrors = checkForbiddenWords(raw, basename)
    if (forbiddenErrors.length > 0) {
      for (const err of forbiddenErrors) {
        console.error(`[FORBIDDEN] ${err}`)
        totalErrors++
      }
    }

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (err) {
      console.error(`[PARSE] ${basename}: JSON 解析失败 - ${err.message}`)
      totalErrors++
      continue
    }

    const errors = validateFile(parsed)
    if (errors.length > 0) {
      console.error(`[SCHEMA] ${basename}:`)
      for (const err of errors) {
        console.error(`  - ${err}`)
      }
      totalErrors++
    }

    summary.push({
      file: basename,
      subject: parsed.subject,
      year: parsed.year,
      questionNo: parsed.questionNo,
      steps: Array.isArray(parsed.steps) ? parsed.steps.length : 0,
      reviewStatus: parsed.reviewStatus,
      finalizationStatus: parsed.finalizationStatus,
      sourcePath: parsed.source?.path,
    })
  }

  console.log('\n=== Motion JSON 校验汇总 ===')
  console.log(`扫描文件数: ${files.length}`)
  console.log(`错误数: ${totalErrors}`)
  for (const item of summary) {
    console.log(
      `- ${item.file} | ${item.subject} ${item.year} Q${item.questionNo} | ${item.steps} 步 | ${item.reviewStatus} / ${item.finalizationStatus}`,
    )
  }

  if (totalErrors > 0) {
    console.error('\n校验失败。')
    process.exit(1)
  }

  console.log('\n全部校验通过。')
}

main().catch((err) => {
  console.error('运行时错误:', err)
  process.exit(1)
})

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')

const SOURCES = {
  math2: 'D:\\work\\Kaoyan-Math2-Papers',
  math1: 'D:\\work\\Kaoyan-Math1-Papers',
}

const ALLOWED_EXTS = new Set(['.md', '.markdown'])

function parseArgs() {
  const args = process.argv.slice(2)
  const params = { subject: null, limit: 1, input: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--subject' && i + 1 < args.length) {
      params.subject = args[i + 1]
      i++
    } else if (args[i] === '--limit' && i + 1 < args.length) {
      params.limit = parseInt(args[i + 1], 10)
      i++
    } else if (args[i] === '--input' && i + 1 < args.length) {
      params.input = args[i + 1]
      i++
    }
  }
  return params
}

async function findMarkdownFiles(dir) {
  const files = []
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (ALLOWED_EXTS.has(ext)) {
          files.push(full)
        }
      }
    }
  }
  await walk(dir)
  return files.filter((f) => basename(f).toLowerCase() !== 'readme.md')
}

function extractYearFromPath(filePath) {
  const name = basename(filePath, extname(filePath))

  let match = name.match(/(19|20)\d{2}/)
  if (match) return parseInt(match[0], 10)

  match = name.match(/math2_(\d{4})/)
  if (match) return parseInt(match[1], 10)

  match = name.match(/math2_(\d{4})-\d{4}/)
  if (match) return parseInt(match[1], 10)

  return 1987
}

function extractQuestionNo(content) {
  const patterns = [
    /^\s*1[.、\s]/m,
    /第\s*1\s*[题]/,
    /\(1\)/,
    /（1）/,
  ]
  for (const p of patterns) {
    if (p.test(content)) return 1
  }
  return 1
}

function extractQuestionStem(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)

  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const line = lines[i].trim()
    if (/^\s*(\d+)[.、\s]/.test(line) && line.length > 4) {
      return line.replace(/^\s*(\d+)[.、\s]+/, '').trim()
    }
  }

  return 'TODO: 题干未能自动提取，需要人工核对'
}

function extractAnswer(content) {
  const markers = ['答案：', '答案:', '【答案】', '解：', '解答：']
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    for (const marker of markers) {
      if (trimmed.startsWith(marker)) {
        return trimmed.slice(marker.length).trim() || 'TODO'
      }
    }
  }
  return 'TODO'
}

function extractExplanation(content) {
  const markers = ['解析：', '解析:', '【解析】', '解答：', '解：']
  const lines = content.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    for (const marker of markers) {
      if (trimmed.startsWith(marker)) {
        const parts = [trimmed.slice(marker.length).trim()]
        for (let j = i + 1; j < Math.min(lines.length, i + 8); j++) {
          if (lines[j].trim().length === 0) continue
          parts.push(lines[j].trim())
        }
        return parts.join(' ')
      }
    }
  }
  return 'TODO'
}

function extractFormulas(content) {
  const display = content.match(/\$\$[\s\S]*?\$\$/g) || []
  const inline = content.match(/\$[^\$\r\n]+?\$/g) || []
  return [...display, ...inline].slice(0, 12)
}

function extractOptions(content) {
  const matches = content.match(/[A-D][.．、\s]+[^\n]+/g) || []
  return matches.slice(0, 4).map((m) => m.trim())
}

function cleanFormula(raw) {
  return raw.replace(/^\$\$?|\$\$?$/g, '').trim()
}

function makeFormulaId(role, index) {
  return `f-${role}-${String(index + 1).padStart(3, '0')}`
}

function createFormula(latex, role, index, displayMode = true) {
  return {
    id: makeFormulaId(role, index),
    latex: cleanFormula(latex),
    displayMode,
    readable: `该公式来自原始 Markdown，具体含义需要人工核对。`,
    role,
  }
}

function generateMotionJSON({ subject, filePath, content }) {
  const year = extractYearFromPath(filePath)
  const questionNo = extractQuestionNo(content)
  const stemMarkdown = extractQuestionStem(content)
  const options = extractOptions(content)
  const answerValue = extractAnswer(content)
  const explanationText = extractExplanation(content)
  const rawFormulas = extractFormulas(content)

  const questionFormulas = rawFormulas.slice(0, 4).map((latex, i) =>
    createFormula(latex, 'question', i, latex.startsWith('$$')),
  )
  const derivationFormulas = rawFormulas.slice(4, 8).map((latex, i) =>
    createFormula(latex, 'derivation', i, latex.startsWith('$$')),
  )
  const allFormulas = [...questionFormulas, ...derivationFormulas]

  const steps = []
  const getId = (n) => `step-${String(n).padStart(3, '0')}`

  // Step 1: show_question
  steps.push({
    id: getId(steps.length + 1),
    type: 'show_question',
    narrationMarkdown: '先阅读题干，找出已知条件和要求。',
    durationMs: 4000,
    formulas: questionFormulas.map((f) => f.id),
    visual: {
      layout: 'question',
      actions: [
        {
          kind: 'fade_in_question',
        },
        {
          kind: 'highlight_question_keywords',
          keywords: ['已知条件', '求', 'TODO'],
        },
      ],
    },
    reviewStatus: 'needs_human_review',
  })

  // Step 2: condition_extract
  steps.push({
    id: getId(steps.length + 1),
    type: 'condition_extract',
    narrationMarkdown: questionFormulas.length > 0
      ? '提取题目中的关键条件或已知公式。'
      : '题目条件未能自动提取，需要人工核对。',
    durationMs: 4000,
    formulas: questionFormulas.slice(0, 2).map((f) => f.id),
    visual: {
      layout: 'blackboard',
      actions: questionFormulas.length > 0
        ? [
            {
              kind: 'write_text',
              text: '关键条件',
            },
            {
              kind: 'write_formula',
              formulaId: questionFormulas[0]?.id,
            },
          ]
        : [
            {
              kind: 'write_text',
              text: 'TODO: 条件需要人工补充',
            },
          ],
    },
    reviewStatus: 'needs_human_review',
  })

  // Step 3: formula_reveal
  if (derivationFormulas.length > 0) {
    steps.push({
      id: getId(steps.length + 1),
      type: 'formula_reveal',
      narrationMarkdown: '揭示解题需要的核心公式或定理。',
      durationMs: 4000,
      formulas: [derivationFormulas[0]?.id].filter(Boolean),
      visual: {
        layout: 'blackboard',
        actions: [
          {
            kind: 'write_text',
            text: '核心公式',
          },
          {
            kind: 'write_formula',
            formulaId: derivationFormulas[0]?.id,
          },
        ],
      },
      reviewStatus: 'needs_human_review',
    })
  }

  // Step 4: equation_transform
  if (derivationFormulas.length >= 2) {
    const fromId = derivationFormulas[0]?.id
    const toId = derivationFormulas[1]?.id
    steps.push({
      id: getId(steps.length + 1),
      type: 'equation_transform',
      narrationMarkdown: '对关键式子进行变形，注意变化的部分。',
      durationMs: 5000,
      formulas: [fromId, toId].filter(Boolean),
      visual: {
        layout: 'blackboard',
        actions: [
          {
            kind: 'transform_formula',
            fromFormulaId: fromId,
            toFormulaId: toId,
            changedTokens: ['TODO: 人工标注变化项'],
          },
        ],
      },
      reviewStatus: 'needs_human_review',
    })
  }

  // Step 5: token_highlight
  if (questionFormulas.length > 0) {
    const formula = questionFormulas[0]
    steps.push({
      id: getId(steps.length + 1),
      type: 'token_highlight',
      narrationMarkdown: '高亮当前步骤中需要重点关注的符号或项。',
      durationMs: 4000,
      formulas: [formula.id],
      visual: {
        layout: 'blackboard',
        actions: [
          {
            kind: 'highlight_formula_tokens',
            formulaId: formula.id,
            tokens: ['x', 'a', '极限', 'TODO'],
            style: 'box',
          },
        ],
      },
      reviewStatus: 'needs_human_review',
    })
  }

  // Step 6: choice_elimination
  if (options.length > 0) {
    steps.push({
      id: getId(steps.length + 1),
      type: 'choice_elimination',
      narrationMarkdown: '逐项分析选项。不确定的项保持待审核状态。',
      durationMs: 5000,
      formulas: [],
      visual: {
        layout: 'split',
        actions: [
          {
            kind: 'eliminate_choice',
            choices: options,
            targetChoice: 'TODO',
          },
        ],
      },
      reviewStatus: 'needs_human_review',
    })
  }

  // Step 7: explanation_text
  steps.push({
    id: getId(steps.length + 1),
    type: 'explanation_text',
    narrationMarkdown:
      explanationText === 'TODO'
        ? '解析未能自动提取，需要人工核对。'
        : `解析摘要：${explanationText}`,
    durationMs: 5000,
    formulas: allFormulas.slice(0, 2).map((f) => f.id),
    visual: {
      layout: 'blackboard',
      actions: [
        {
          kind: 'write_text',
          text: explanationText === 'TODO' ? 'TODO: 解析需要人工补充' : explanationText,
        },
      ],
    },
    reviewStatus: 'needs_human_review',
  })

  // Step 8: conclusion_reveal
  steps.push({
    id: getId(steps.length + 1),
    type: 'conclusion_reveal',
    narrationMarkdown:
      answerValue === 'TODO'
        ? '答案未能自动提取，需要人工核对。'
        : `最终答案：${answerValue}。真实答案必须经人工核对原题与解析后确认。`,
    durationMs: 3500,
    formulas: [],
    visual: {
      layout: 'blackboard',
      actions: [
        {
          kind: 'reveal_conclusion',
        },
      ],
    },
    reviewStatus: 'needs_human_review',
  })

  return {
    schemaVersion: 'motion-explanation-v1',
    subject,
    year,
    questionNo,
    source: {
      type: 'markdown',
      path: filePath,
      status: 'needs_human_review',
    },
    reviewStatus: 'needs_human_review',
    finalizationStatus: 'blocked',
    question: {
      stemMarkdown,
      options: options.length > 0 ? options : undefined,
      formulas: questionFormulas,
    },
    answer: {
      value: answerValue,
      markdown:
        answerValue === 'TODO'
          ? '答案待人工核对'
          : `答案：${answerValue}`,
      formulas: [],
    },
    explanation: {
      summaryMarkdown:
        explanationText === 'TODO'
          ? '解题思路待人工补充。'
          : `整体解题思路：${explanationText}`,
      steps,
    },
    rendering: {
      mathRenderer: 'katex',
      markdownMath: true,
      supportsDisplayMath: true,
      supportsInlineMath: true,
    },
  }
}

async function main() {
  const args = parseArgs()

  if (!args.subject || !SOURCES[args.subject]) {
    console.error('请指定 --subject math1 或 --subject math2')
    process.exit(1)
  }

  let files = []
  if (args.input) {
    files = [args.input]
  } else {
    files = await findMarkdownFiles(SOURCES[args.subject])
    files.sort()
  }

  if (files.length === 0) {
    console.error(`未在 ${SOURCES[args.subject]} 找到合适的 Markdown 文件。`)
    process.exit(1)
  }

  const limit = Math.max(1, args.limit)
  const selected = files.slice(0, limit)

  const exportsDir = join(root, 'exports', 'motion-json')
  await mkdir(exportsDir, { recursive: true })

  for (const filePath of selected) {
    const content = await readFile(filePath, 'utf8')
    const motion = generateMotionJSON({ subject: args.subject, filePath, content })
    const outName = `${motion.subject}-${motion.year}-q${String(
      motion.questionNo,
    ).padStart(3, '0')}.motion.json`
    const outPath = join(exportsDir, outName)
    await writeFile(outPath, JSON.stringify(motion, null, 2) + '\n', 'utf8')
    console.log(`已生成: ${outPath}`)

    const samplePath = join(root, 'src', 'data', 'sample-from-md.motion.json')
    await writeFile(samplePath, JSON.stringify(motion, null, 2) + '\n', 'utf8')
    console.log(`已更新播放器样例: ${samplePath}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

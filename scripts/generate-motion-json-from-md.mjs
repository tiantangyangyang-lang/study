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

function extractQuestionText(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)

  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const line = lines[i].trim()
    if (/^\s*(\d+)[.、\s]/.test(line) && line.length > 4) {
      return line.replace(/^\s*(\d+)[.、\s]+/, '').trim()
    }
  }

  return 'TODO: 题干未能自动提取，需要人工核对'
}

function extractChoices(content) {
  const matches = content.match(/[A-D][.．、\s]+[^\n]+/g) || []
  return matches.slice(0, 4).map((m) => m.trim())
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
  return 'TODO: 答案未能自动提取，需要人工核对'
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
  return 'TODO: 解析未能自动提取，需要人工核对'
}

function extractFormulas(content) {
  const display = content.match(/\$\$[\s\S]*?\$\$/g) || []
  const inline = content.match(/\$[^\$\r\n]+?\$/g) || []
  return [...display, ...inline].slice(0, 8)
}

function cleanFormula(raw) {
  return raw.replace(/^\$\$?|\$\$?$/g, '').trim()
}

function generateMotionJSON({ subject, filePath, content }) {
  const year = extractYearFromPath(filePath)
  const questionNo = extractQuestionNo(content)
  const questionText = extractQuestionText(content)
  const choices = extractChoices(content)
  const answer = extractAnswer(content)
  const explanation = extractExplanation(content)
  const formulas = extractFormulas(content)

  const steps = []
  const getId = (n) => `step-${String(n).padStart(3, '0')}`

  // Step 1: intro
  steps.push({
    id: getId(steps.length + 1),
    type: 'intro',
    narration: `本题为 ${subject === 'math1' ? '数学一' : '数学二'} ${year} 年第 ${questionNo} 题。以下内容从 Markdown 文件自动提取，尚未人工核对，需要审核。`,
    formula: null,
    durationMs: 3000,
    reviewStatus: 'needs_human_review',
    visual: {
      layout: 'blackboard',
      actions: [
        {
          kind: 'write_text',
          text: `${subject === 'math1' ? '数学一' : '数学二'} ${year} 年第 ${questionNo} 题`,
        },
      ],
    },
  })

  // Step 2: show_question
  steps.push({
    id: getId(steps.length + 1),
    type: 'show_question',
    narration: `请先读题：${questionText}`,
    formula: null,
    durationMs: 4000,
    reviewStatus: 'needs_human_review',
    visual: {
      layout: 'question',
      actions: [
        {
          kind: 'write_text',
          text: questionText,
        },
      ],
    },
  })

  // Step 3: condition_extract
  const conditionFormula = formulas[0] ? cleanFormula(formulas[0]) : null
  steps.push({
    id: getId(steps.length + 1),
    type: 'condition_extract',
    narration: conditionFormula
      ? '提取题目中的关键条件或已知公式。'
      : '题目条件未能自动提取，需要人工核对。',
    formula: conditionFormula,
    durationMs: 4000,
    reviewStatus: 'needs_human_review',
    visual: {
      layout: 'blackboard',
      actions: conditionFormula
        ? [
            {
              kind: 'write_text',
              text: '关键条件',
            },
            {
              kind: 'box_region',
              region: { x: 10, y: 10, width: 200, height: 60 },
              color: '#f59e0b',
            },
            {
              kind: 'write_formula',
              formula: conditionFormula,
            },
          ]
        : [
            {
              kind: 'write_text',
              text: 'TODO: 条件需要人工补充',
            },
          ],
    },
  })

  // Step 4: formula_reveal
  if (formulas.length >= 2) {
    const formula = cleanFormula(formulas[1])
    steps.push({
      id: getId(steps.length + 1),
      type: 'formula_reveal',
      narration: '揭示解题需要的核心公式。',
      formula,
      durationMs: 4000,
      reviewStatus: 'needs_human_review',
      visual: {
        layout: 'blackboard',
        actions: [
          {
            kind: 'write_text',
            text: '核心公式',
          },
          {
            kind: 'write_formula',
            formula,
          },
        ],
      },
    })
  }

  // Step 5: equation_transform
  if (formulas.length >= 3) {
    const fromFormula = cleanFormula(formulas[1] || formulas[0])
    const toFormula = cleanFormula(formulas[2])
    steps.push({
      id: getId(steps.length + 1),
      type: 'equation_transform',
      narration: '对关键式子进行变形，注意变化的部分。',
      formula: toFormula,
      durationMs: 5000,
      reviewStatus: 'needs_human_review',
      visual: {
        layout: 'blackboard',
        actions: [
          {
            kind: 'transform_formula',
            fromFormula,
            toFormula,
            changedTokens: ['TODO: 人工标注变化项'],
          },
        ],
      },
    })
  }

  // Step 6: token_highlight
  if (formulas.length > 0) {
    const formula = cleanFormula(formulas[0])
    steps.push({
      id: getId(steps.length + 1),
      type: 'token_highlight',
      narration: '高亮当前步骤中需要重点关注的符号或项。',
      formula,
      durationMs: 4000,
      reviewStatus: 'needs_human_review',
      visual: {
        layout: 'blackboard',
        actions: [
          {
            kind: 'highlight_tokens',
            formula,
            tokens: ['x', 'a', '极限', 'TODO'],
            style: 'box',
          },
        ],
      },
    })
  }

  // Step 7: choice_elimination (if choices detected)
  if (choices.length > 0) {
    steps.push({
      id: getId(steps.length + 1),
      type: 'choice_elimination',
      narration: '逐项分析选项。不确定的项保持待审核状态。',
      formula: null,
      durationMs: 5000,
      reviewStatus: 'needs_human_review',
      visual: {
        layout: 'split',
        actions: [
          {
            kind: 'eliminate_choice',
            choices,
            targetChoice: 'TODO',
          },
        ],
      },
    })
  }

  // Step 8: explanation_text
  steps.push({
    id: getId(steps.length + 1),
    type: 'explanation_text',
    narration: `解析摘要：${explanation}`,
    formula: null,
    durationMs: 5000,
    reviewStatus: 'needs_human_review',
    visual: {
      layout: 'blackboard',
      actions: [
        {
          kind: 'write_text',
          text: explanation,
        },
      ],
    },
  })

  // Step 9: conclusion_reveal
  steps.push({
    id: getId(steps.length + 1),
    type: 'conclusion_reveal',
    narration: `最终答案：${answer}。真实答案必须经人工核对原题与解析后确认。`,
    formula: null,
    durationMs: 3500,
    reviewStatus: 'needs_human_review',
    visual: {
      layout: 'blackboard',
      actions: [
        {
          kind: 'reveal_answer',
          text: answer,
        },
      ],
    },
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
    title: `${subject === 'math1' ? '数学一' : '数学二'} ${year} 第 ${questionNo} 题（自动提取，待核对）`,
    questionText,
    answer,
    choices: choices.length > 0 ? choices : undefined,
    reviewStatus: 'needs_human_review',
    finalizationStatus: 'blocked',
    estimatedDurationMs: steps.reduce((sum, s) => sum + s.durationMs, 0),
    steps,
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

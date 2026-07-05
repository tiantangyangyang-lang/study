import { readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const SOURCES = [
  {
    subject: 'math2',
    path: 'D:\\work\\Kaoyan-Math2-Papers',
  },
  {
    subject: 'math1',
    path: 'D:\\work\\Kaoyan-Math1-Papers',
  },
]

const ALLOWED_EXTENSIONS = new Set(['.md', '.markdown'])
const IGNORED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.docx',
])

async function walk(dir, baseDir, subject, result) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath, baseDir, subject, result)
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase()
      if (ALLOWED_EXTENSIONS.has(ext)) {
        result.md.push({
          subject,
          path: fullPath,
          relPath: relative(baseDir, fullPath),
          size: (await stat(fullPath)).size,
        })
      } else if (IGNORED_EXTENSIONS.has(ext)) {
        result.ignored.push({
          subject,
          path: fullPath,
          relPath: relative(baseDir, fullPath),
          reason: `${ext} 文件被显式忽略`,
        })
      }
    }
  }
}

async function main() {
  const result = { md: [], ignored: [] }

  for (const source of SOURCES) {
    try {
      await walk(source.path, source.path, source.subject, result)
    } catch (err) {
      console.error(`扫描失败: ${source.path}`, err.message)
    }
  }

  console.log('=== Markdown 来源扫描结果 ===\n')

  console.log(`允许读取的目录:`)
  for (const source of SOURCES) {
    console.log(`  - ${source.path} → subject: ${source.subject}`)
  }

  console.log(`\n忽略的文件类型: ${Array.from(IGNORED_EXTENSIONS).join(', ')}`)

  console.log(`\n找到的 Markdown 文件 (${result.md.length} 个):`)
  for (const file of result.md) {
    console.log(`  [${file.subject}] ${file.path} (${file.size} bytes)`)
  }

  if (result.ignored.length > 0) {
    console.log(`\n显式忽略的非 Markdown 文件 (${result.ignored.length} 个):`)
    for (const file of result.ignored) {
      console.log(`  [${file.subject}] ${file.path} (${file.reason})`)
    }
  }

  console.log('\n=== 摘要 ===')
  console.log(`Markdown 文件总数: ${result.md.length}`)
  console.log(`被忽略文件数: ${result.ignored.length}`)
  console.log(`未读取 PDF、图片或 OCR 文件。`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

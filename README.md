> > 这是重新生成的独立项目。旧 `D:\work\kaoyan-motion-explanations` 已清空并重建。

# 考研真题 Motion 动态解析生成器

## 项目定位

独立 Motion 动态解析预览项目，位于：

```
D:\work\kaoyan-motion-explanations
```

## 来源规则

只读取 Markdown 文件，来源目录固定为：

- `D:\work\Kaoyan-Math2-Papers` → subject = `math2`
- `D:\work\Kaoyan-Math1-Papers` → subject = `math1`

## 禁止行为

- 不读取 PDF。
- 不读取图片（png / jpg / jpeg / webp）。
- 不 OCR。
- 不读取 `D:\work\kaoyan`。
- 不修改来源目录。
- 不连接数据库。
- 不生成视频。
- 不生成独立 React 代码。

## 技术栈

- Vite + React + TypeScript
- Motion（`import { motion, AnimatePresence } from "motion/react"`）
- KaTeX 公式渲染
- Zod JSON 校验

## 安装依赖

```powershell
cd D:\work\kaoyan-motion-explanations
npm.cmd install
```

## 扫描 MD 来源

```powershell
node scripts\scan-md-sources.mjs
```

## 生成一个样例 Motion JSON

优先尝试数学二：

```powershell
node scripts\generate-motion-json-from-md.mjs --subject math2 --limit 1
```

如果数学二没有合适 MD，改用数学一：

```powershell
node scripts\generate-motion-json-from-md.mjs --subject math1 --limit 1
```

生成结果默认写入：

- `exports\motion-json\`
- `src\data\sample-from-md.motion.json`（播放器样例）

## 校验 JSON

```powershell
node scripts\validate-motion-json.mjs
```

## 启动本地预览

```powershell
npm.cmd run dev
```

浏览器打开 `http://localhost:5173`。

## 新增一题

1. 确认真题在来源目录中有对应 `.md` 文件。
2. 运行 `node scripts\generate-motion-json-from-md.mjs --subject math2 --input "真实路径.md"`。
3. 检查生成的 JSON，所有不确定字段必须保持 `missing` / `TODO` / `needs_human_review`。
4. 运行 `node scripts\validate-motion-json.mjs`。
5. 人工审核后，才允许将 `reviewStatus` 改为 `verified`、`finalizationStatus` 改为 `ready`。

## 限制说明

- 当前不写数据库、不改数据库 schema。
- 不生成视频文件。
- 所有生成 JSON 默认 `needs_human_review` / `blocked`。
- 不编造题干、答案、公式、解析。
- 导入原项目数据库属于未来步骤，不在当前范围。

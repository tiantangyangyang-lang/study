# Motion 动态解析 JSON Schema

版本：`motion-explanation-v1`

## 设计原则

- 每道题只保存结构化 JSON，不保存 React 代码、JavaScript 函数、HTML 片段。
- 来源必须指向 `.md` 或 `.markdown` 文件。
- JSON 默认状态 `needs_human_review` / `blocked`。
- 播放器统一读取 JSON 并渲染动画、公式、步骤时间轴。

## 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `schemaVersion` | string | 是 | 固定为 `motion-explanation-v1` |
| `subject` | string | 是 | `math1` 或 `math2` |
| `year` | integer | 是 | 真题年份，1980-2100 |
| `questionNo` | integer | 是 | 题号，正整数 |
| `source` | object | 是 | 来源信息 |
| `title` | string | 是 | 题目标题 |
| `questionText` | string | 是 | 题干；提取不到写 `missing` |
| `answer` | string | 是 | 答案；提取不到写 `missing` |
| `reviewStatus` | string | 是 | `needs_human_review`（默认）/ `verified` / `rejected` |
| `finalizationStatus` | string | 是 | `blocked`（默认）/ `ready` / `imported` |
| `estimatedDurationMs` | integer | 是 | 预计总时长（毫秒），非负 |
| `steps` | array | 是 | 非空步骤数组 |

## source 对象

```json
{
  "type": "markdown",
  "path": "D:\\work\\Kaoyan-Math1-Papers\\papers\\1987年考研数学(一)真题.md",
  "status": "needs_human_review"
}
```

- `type`：固定为 `markdown`。
- `path`：真实 MD 文件路径，必须以 `.md` 或 `.markdown` 结尾。
- `status`：来源本身的审核状态。

## steps 数组元素

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | 是 | 步骤唯一标识 |
| `type` | string | 是 | 步骤类型，见下表 |
| `narration` | string | 是 | 步骤讲解文本 |
| `formula` | string \| null | 是 | KaTeX 公式字符串，无公式时为 `null` |
| `durationMs` | integer | 是 | 该步骤建议停留时长（毫秒） |
| `reviewStatus` | string | 是 | 步骤级审核状态 |

## 允许的 step type

- `intro`：引入题目与条件
- `show_question`：展示题干
- `show_formula`：展示公式
- `transform_formula`：公式变形/推导
- `highlight`：高亮关键信息/易错点
- `explanation_text`：纯文字说明
- `choice_elimination`：选择题选项排除
- `conclusion`：结论/答案

## 禁止内容

JSON 文本中不得出现以下字符串：

- `<script`
- `javascript:`
- `function`
- `=>`
- `import`
- `export`
- `eval(`
- `new Function`

## 状态流转

```
needs_human_review -> verified / rejected
blocked -> ready -> imported
```

## 示例

见 `src/data/sample-from-md.motion.json`。

# 考研真题 Motion 动态解析工作流

## 总览

MD 真题文件
  → 提取题干 / 选项 / 答案 / 解析 / 公式
  → 生成 Motion JSON
  → 人工审核
  → 本地 Motion 预览
  → 运行校验脚本
  → 校验通过
  → 未来再考虑导入数据库

## 阶段 1：确认 MD 来源

允许的来源目录：

- `D:\work\Kaoyan-Math2-Papers`（subject = `math2`）
- `D:\work\Kaoyan-Math1-Papers`（subject = `math1`）

只读取 `.md` / `.markdown` 文件。

扫描命令：

```powershell
node scripts\scan-md-sources.mjs
```

## 阶段 2：生成一个样例 Motion JSON

优先尝试数学二：

```powershell
node scripts\generate-motion-json-from-md.mjs --subject math2 --limit 1
```

如果没有合适的数学二 MD，改用数学一：

```powershell
node scripts\generate-motion-json-from-md.mjs --subject math1 --limit 1
```

## 阶段 3：人工审核 JSON

必须核对：

1. 题干是否完整准确。
2. 公式 LaTeX 是否能被 KaTeX 正确渲染。
3. 答案是否正确。
4. 解析是否合理。
5. 时长设置是否合适。

如果 MD 中未明确给出答案或解析，保持 `missing` / `TODO` / `needs_human_review`。

审核通过后再修改：

- `reviewStatus` → `verified`
- `finalizationStatus` → `ready`

## 阶段 4：本地 Motion 预览

```powershell
npm.cmd run dev
```

浏览器打开 `http://localhost:5173`。

播放器显示：

- 左侧：题目信息、题干、答案、来源 MD 路径、步骤时间轴。
- 右侧：当前步骤动画与公式。
- 底部：播放控制与进度条。

## 阶段 5：校验 JSON

```powershell
node scripts\validate-motion-json.mjs
```

校验项：

- 扫描 `src/data/*.motion.json` 与 `exports/motion-json/*.motion.json`。
- `subject` 只能是 `math1` 或 `math2`。
- `source.type` 必须是 `markdown`。
- `source.path` 必须以 `.md` 或 `.markdown` 结尾，禁止 `.pdf`。
- `reviewStatus` 必须是 `needs_human_review`。
- `finalizationStatus` 必须是 `blocked`。
- 检查禁用词。

## 阶段 6：导出与未来导入

通过校验的 JSON 放入 `exports/motion-json/`。

导入原项目数据库是**未来步骤**，当前不做：

- 不连接数据库。
- 不改数据库 schema。
- 不把 JSON 直接写入来源目录或 `D:\work\kaoyan`。

## 注意事项

- 示例 JSON 默认状态为 `needs_human_review` / `blocked`，禁止直接用于教学或发布。
- 所有生成结果必须通过 `validate-motion-json.mjs`。
- 不编造题干、答案、公式、解析。

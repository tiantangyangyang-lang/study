import { useEffect, useState } from 'react'
import MotionExplainPlayer from './motion-explain/MotionExplainPlayer'
import { motionExplanationSchema } from './motion-explain/schema'
import type { MotionExplanationJSON } from './motion-explain/types'

export default function App() {
  const [data, setData] = useState<MotionExplanationJSON | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    import('./data/sample-from-md.motion.json')
      .then((module) => {
        const result = motionExplanationSchema.safeParse(module.default)
        if (!result.success) {
          setError('样例 JSON 校验失败：' + result.error.message)
          return
        }
        setData(result.data)
      })
      .catch((err) => {
        setError('加载样例 JSON 失败：' + String(err))
      })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>考研真题 Motion 动态解析舞台</h1>
      </header>
      <main className="app-main">
        {error && (
          <div className="panel" role="alert">
            {error}
          </div>
        )}
        {!error && data && <MotionExplainPlayer explanation={data} />}
      </main>
    </div>
  )
}

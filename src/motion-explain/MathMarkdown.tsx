import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface MathMarkdownProps {
  children: string
  className?: string
}

export default function MathMarkdown({ children, className }: MathMarkdownProps) {
  const content = useMemo(() => {
    return children.replace(/\\\$/g, '$')
  }, [children])

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="md-paragraph">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

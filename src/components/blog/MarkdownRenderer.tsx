'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

interface Props {
  content: string
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Use next/image for images from Supabase Storage
          img({ src, alt }) {
            if (!src || typeof src !== 'string') return null
            return (
              <span className="block my-6">
                <Image
                  src={src}
                  alt={alt ?? ''}
                  width={800}
                  height={500}
                  className="rounded-xl shadow-md w-full h-auto object-cover"
                  unoptimized={!src.includes('.supabase.co')}
                />
              </span>
            )
          },
          // Open links in new tab
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-blue-600 hover:underline"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

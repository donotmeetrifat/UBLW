'use client'

import React from 'react'

/**
 * FormattedMessageText: Renders AI messages with clean bold formatting,
 * handles **bold** and *italic*, cleans stray asterisks,
 * and automatically applies 'font-bengali' (Noto Serif Bengali) to all Bengali text.
 */
export default function FormattedMessageText({ text, isUser = false, className = '' }) {
    if (!text) return null

    const hasBengali = /[\u0980-\u09FF]/.test(text)
    const paragraphs = String(text).split(/\n/)

    return (
        <div className={`space-y-1.5 ${hasBengali ? 'font-bengali' : ''} ${className}`}>
            {paragraphs.map((line, pIdx) => {
                if (!line.trim()) {
                    return <div key={pIdx} className="h-1.5" />
                }

                // Parse **bold** and *italic* markdown tokens
                const tokens = line.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g)

                return (
                    <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
                        {tokens.map((token, tIdx) => {
                            if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
                                const boldContent = token.slice(2, -2)
                                return (
                                    <strong
                                        key={tIdx}
                                        className={`font-black ${isUser ? 'text-white' : 'text-[#241224]'}`}
                                    >
                                        {boldContent}
                                    </strong>
                                )
                            }
                            if (token.startsWith('*') && token.endsWith('*') && token.length > 2 && !token.startsWith('**')) {
                                const italicContent = token.slice(1, -1)
                                return (
                                    <em key={tIdx} className="italic opacity-90">
                                        {italicContent}
                                    </em>
                                )
                            }
                            // Clean any stray rogue unclosed asterisks
                            const cleaned = token.replace(/\*\*/g, '')
                            return cleaned
                        })}
                    </p>
                )
            })}
        </div>
    )
}

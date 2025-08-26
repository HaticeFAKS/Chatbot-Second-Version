"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Mesajınızı yazın...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
    }
  }, [message])

  const handleSend = () => {
    const trimmed = message.trim()
    if (trimmed && !isLoading && !disabled) {
      onSendMessage(trimmed)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = message.trim().length > 0 && !isLoading && !disabled

  return (
    <Card
      // üstteki kutucuklarla aynı aile: belirgin sınır + hafif yükseltilmiş arka plan
      className="border border-sage-200/60 dark:border-sage-800/70 bg-sage-50/90 dark:bg-sage-950/50 backdrop-blur-sm shadow-lg"
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-end gap-2 sm:gap-3">
          {/* Textarea */}
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={cn(
                // boyutlandırma: komponentin baz stilini bozma
                "min-h-[44px] max-h-[120px] resize-none rounded-xl transition-all duration-200",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
            />

            {/* Uzun mesaj sayacı */}
            {message.length > 100 && (
              <div className="absolute -bottom-5 right-2 text-xs text-muted-foreground">
                {message.length}/1000
              </div>
            )}
          </div>

          {/* Gönder butonu */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Mesajı gönder"
            title={isLoading ? "Gönderiliyor..." : "Mesaj gönder (Enter)"}
            className={cn(
              "w-10 h-10 p-0 rounded-full transition-all duration-200",
              "bg-[#a8cc44] hover:bg-[#a8cc44]/90 dark:bg-[#8fb83a] dark:hover:bg-[#7da332]",
              "shadow-lg hover:shadow-xl",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
              canSend && "hover:scale-105"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>

        {/* Alt yardım metni */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="hidden sm:inline">
            Enter ile gönder, Shift+Enter ile yeni satır
          </span>
          <span className="sm:hidden">Enter ile gönder</span>
        </div>
      </div>
    </Card>
  )
}

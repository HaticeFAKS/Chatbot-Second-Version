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
      className="border border-sage-200/60 dark:border-sage-800/70 bg-sage-50/90 dark:bg-sage-950/50 backdrop-blur-sm shadow-sm"
    >
      <div className="p-2 sm:p-3">
        <div className="flex items-end gap-2">
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
                "min-h-[36px] max-h-[100px] resize-none rounded-lg transition-all duration-200 text-sm",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
            />

            {/* Uzun mesaj sayacı */}
            {message.length > 100 && (
              <div className="absolute -bottom-4 right-2 text-xs text-muted-foreground">
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
              "w-9 h-9 p-0 rounded-full transition-all duration-200",
              "bg-[#a8cc44] hover:bg-[#a8cc44]/90 dark:bg-[#8fb83a] dark:hover:bg-[#7da332]",
              "shadow-md hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
              canSend && "hover:scale-105"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
            ) : (
              <Send className="h-3.5 w-3.5 text-white" />
            )}
          </Button>
        </div>

        {/* Alt yardım metni - sadece desktop'ta göster */}
        <div className="mt-1 hidden sm:block text-xs text-muted-foreground">
          <span>Enter ile gönder, Shift+Enter ile yeni satır</span>
        </div>
      </div>
    </Card>
  )
}

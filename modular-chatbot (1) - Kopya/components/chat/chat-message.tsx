"use client"

import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"
import { MessageRating } from "./message-rating"
import { QuickRating } from "./quick-rating"

interface ChatMessageComponentProps {
  message: ChatMessage
  ratingStyle?: "stars" | "thumbs"
  onRatingChange?: (messageId: string, rating: number) => void
}

export function ChatMessageComponent({
  message,
  ratingStyle = "stars",
  onRatingChange,
}: ChatMessageComponentProps) {
  const isBot = message.sender === "bot"

  return (
    <div className={cn("flex gap-3 w-full px-2 sm:px-4 py-3", isBot ? "" : "justify-end")}>
      {isBot && (
        <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-[#a8cc44] to-lime-600 rounded-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-[80%]">
        <div
          className={cn(
            "p-4 rounded-lg shadow-sm border",
            isBot
              ? "bg-[#a8cc44]/10 dark:bg-[#a8cc44]/20 border-[#a8cc44]/20 dark:border-[#a8cc44]/30"
              : "bg-card border-border",
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

        {/* Puanlama sadece bot mesajlarında */}
        {isBot && onRatingChange && (
          ratingStyle === "stars" ? (
            <MessageRating
              messageId={message.id}
              currentRating={message.rating ?? 0}
              onRatingChange={onRatingChange}
              disabled={false}
            />
          ) : (
            <QuickRating
              messageId={message.id}
              currentRating={message.rating ?? 0}
              onRatingChange={onRatingChange}
              disabled={false}
            />
          )
        )}
      </div>
    </div>
  )
}

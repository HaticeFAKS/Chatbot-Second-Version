"use client"

import type { ChatMessage } from "@/lib/types"
import { ChatMessageComponent } from "./chat-message"
import { MascotAvatar } from "./mascot-avatar"
import { cn } from "@/lib/utils"

interface ChatMessageListProps {
  messages: ChatMessage[]
  ratingStyle?: "stars" | "thumbs"
  onRatingChange?: (messageId: string, rating: number) => void
  isLoading?: boolean
}

export function ChatMessageList({
  messages,
  ratingStyle = "thumbs",
  onRatingChange,
  isLoading = false,
}: ChatMessageListProps) {
  return (
    <div className="flex flex-col gap-3 p-2 sm:p-4">
      {messages.map((m) => (
        <ChatMessageComponent
          key={m.id}
          message={m}
          ratingStyle={ratingStyle}
          onRatingChange={onRatingChange}
        />
      ))}

      {/* Bot yazıyor göstergesi */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <MascotAvatar state="typing" size={36} />
          <div
            className={cn(
              "rounded-2xl px-3 py-2 border shadow-sm",
              "bg-sage-50/90 border-sage-200/70",
              "dark:bg-sage-950/50 dark:border-sage-800/70"
            )}
          >
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#a8cc44] dark:bg-[#8fb83a] animate-bounce [animation-delay:-.2s]" />
              <span className="h-2 w-2 rounded-full bg-[#a8cc44] dark:bg-[#8fb83a] animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-[#a8cc44] dark:bg-[#8fb83a] animate-bounce [animation-delay:.2s]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatMessageList

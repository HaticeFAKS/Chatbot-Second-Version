"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageRatingProps {
  messageId: string
  currentRating?: number
  onRatingChange: (messageId: string, rating: number) => void
  disabled?: boolean
}

export function MessageRating({
  messageId,
  currentRating = 0,
  onRatingChange,
  disabled = false,
}: MessageRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  // Parent rating güncellenince hover'ı sıfırla
  useEffect(() => {
    setHovered(null)
  }, [currentRating])

  const display = hovered ?? currentRating

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-muted-foreground">Bu yanıt faydalı mıydı?</span>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Button
            key={rating}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "w-6 h-6 p-0 hover:bg-transparent transition-all duration-200",
              !disabled && "hover:scale-110",
              disabled && "cursor-not-allowed opacity-50",
            )}
            disabled={disabled}
            onClick={() => !disabled && onRatingChange(messageId, rating)}
            onMouseEnter={() => !disabled && setHovered(rating)}
            onMouseLeave={() => !disabled && setHovered(null)}
            title={`${rating} yıldız ver`}
            aria-pressed={rating <= currentRating}
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all duration-200",
                rating <= display ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300",
              )}
            />
          </Button>
        ))}
      </div>

      {currentRating > 0 && (
        <div className="flex items-center gap-1 animate-fade-in">
          <ThumbsUp className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400">Teşekkürler! ({currentRating}/5)</span>
        </div>
      )}
    </div>
  )
}

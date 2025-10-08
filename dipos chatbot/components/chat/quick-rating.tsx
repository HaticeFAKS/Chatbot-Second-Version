"use client"

import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickRatingProps {
  messageId: string
  currentRating?: number
  onRatingChange: (messageId: string, rating: number) => void
  disabled?: boolean
}

export function QuickRating({ messageId, currentRating, onRatingChange, disabled = false }: QuickRatingProps) {
  const val = currentRating ?? 0
  const isPositive = val >= 4
  const isNegative = val > 0 && val <= 2

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-muted-foreground">Bu yanıt nasıldı?</span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-8 h-8 p-0 transition-all duration-200",
            isPositive && "bg-green-100 dark:bg-green-900/20",
            !disabled && "hover:bg-green-50 dark:hover:bg-green-900/10 hover:scale-105",
            disabled && "cursor-default",
          )}
          disabled={disabled}
          onClick={() => !disabled && onRatingChange(messageId, 5)}
          title="Faydalı"
        >
          <ThumbsUp className={cn("w-4 h-4 transition-colors", isPositive ? "text-green-600 fill-green-600" : "text-gray-400 hover:text-green-500")} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-8 h-8 p-0 transition-all duration-200",
            isNegative && "bg-red-100 dark:bg-red-900/20",
            !disabled && "hover:bg-red-50 dark:hover:bg-red-900/10 hover:scale-105",
            disabled && "cursor-default",
          )}
          disabled={disabled}
          onClick={() => !disabled && onRatingChange(messageId, 1)}
          title="Faydalı değil"
        >
          <ThumbsDown className={cn("w-4 h-4 transition-colors", isNegative ? "text-red-600 fill-red-600" : "text-gray-400 hover:text-red-500")} />
        </Button>
      </div>

      {val > 0 && (
        <span className="text-xs text-muted-foreground animate-fade-in">
          {isPositive ? "Teşekkürler!" : isNegative ? "Geri bildiriminiz alındı" : `Puanınız: ${val}/5`}
        </span>
      )}
    </div>
  )
}

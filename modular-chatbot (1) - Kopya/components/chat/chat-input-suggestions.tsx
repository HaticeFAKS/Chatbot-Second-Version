"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, HelpCircle, Settings, Info } from "lucide-react"

interface ChatInputSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  isVisible?: boolean
}

export function ChatInputSuggestions({ onSuggestionClick, isVisible = true }: ChatInputSuggestionsProps) {
  const suggestions = [
    {
      icon: Info,
      text: "Merhaba, size nasıl yardımcı olabilirim?",
      category:"pricing",
    },
    {
      icon: Info,
      text: "Ürünleriniz hakkında bilgi alabilir miyim?",
      category:"pricing",
    },
    {
      icon: Info,
      text: "Hesap ayarlarım ile ilgili yardım istiyorum",
      category: "pricing",
    },
    {
      icon: Info,
      text: "Fiyatlandırma hakkında bilgi verir misiniz?",
      category: "pricing",
    },
  ]

  if (!isVisible) return null

  return (
    <Card className="border-0 bg-[#2596be]/5 dark:bg-[#2596be]/10 shadow-sm">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Önerilen sorular:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-3 text-left justify-start hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => onSuggestionClick(suggestion.text)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="w-8 h-8 bg-[#2596be] rounded-lg flex items-center justify-center shrink-0">
                  <suggestion.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-foreground leading-relaxed">{suggestion.text}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}

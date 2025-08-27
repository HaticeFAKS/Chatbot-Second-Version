"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, HelpCircle, Settings, Info } from "lucide-react"

interface ChatWelcomeProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  const suggestions = [
    {
      icon: HelpCircle,
      text: "Merhaba, size nasıl yardımcı olabilirim?",
      category: "product",
    },
    {
      icon: HelpCircle,
      text: "Ürünleriniz hakkında bilgi alabilir miyim?",
      category: "product",
    },
    {
      icon: HelpCircle,
      text: "Hesap ayarlarım ile ilgili yardım istiyorum",
      category: "product",
    },
    {
      icon: HelpCircle,
      text: "Fiyatlandırma hakkında bilgi verir misiniz?",
      category: "product",
    },
  ]

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Hero */}
          <div className="space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#a8cc44] rounded-full flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">AI Asistanınıza Hoş Geldiniz</h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Size yardımcı olmak için buradayım. Sorularınızı sormaya başlayın!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {suggestions.map((suggestion, i) => (
              <Card
                key={i}
                className="p-3 sm:p-4 border bg-[#a8cc44]/5 dark:bg-[#a8cc44]/10 border-[#a8cc44]/20 dark:border-[#a8cc44]/30
                           hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => onSuggestionClick?.(suggestion.text)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#a8cc44] flex items-center justify-center shrink-0 shadow">
                    <suggestion.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base text-foreground leading-relaxed">{suggestion.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-lg p-4 sm:p-6 border bg-[#a8cc44]/5 border-[#a8cc44]/20 dark:bg-[#a8cc44]/10 dark:border-[#a8cc44]/30">
            <p className="text-sm sm:text-base text-foreground font-medium">
              Başlamak için aşağıdaki mesaj kutusuna sorularınızı yazın
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

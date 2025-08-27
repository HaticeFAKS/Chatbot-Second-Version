"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"
import { MessageRating } from "./message-rating"
import { QuickRating } from "./quick-rating"
import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ZoomIn, Download } from "lucide-react"

interface ChatMessageComponentProps {
  message: ChatMessage
  ratingStyle?: "stars" | "thumbs"
  onRatingChange?: (messageId: string, rating: number) => void
}

// Markdown temizleme fonksiyonu - sadece düz metin için
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // **bold** -> bold
    .replace(/\*(.*?)\*/g, '$1')     // *italic* -> italic
    .replace(/#{1,6}\s/g, '')        // # headers -> normal text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](link) -> text
    .trim();
}

// HTML içerik kontrolü ve renderlama
function renderContent(content: string): React.JSX.Element {
  // HTML içerik varsa direkt render et
  if (content.includes('<') && content.includes('>')) {
    return (
      <div 
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          // Ensure videos and iframes are responsive
          '--tw-prose-body': 'var(--muted-foreground)',
        } as React.CSSProperties}
      />
    );
  }
  
  // Düz metin ise markdown temizle
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
      {cleanMarkdown(content)}
    </div>
  );
}

// Image Gallery Component
function ImageGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images || images.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((imageUrl, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-border/50 hover:border-border transition-colors">
                <img
                  src={imageUrl}
                  alt={`Resim ${index + 1}`}
                  className="w-full h-24 sm:h-32 object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-24 sm:h-32 bg-muted flex items-center justify-center text-muted-foreground text-xs">Resim yüklenemedi</div>'
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full p-0">
              <DialogTitle className="sr-only">Resim Görüntüleyici</DialogTitle>
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={`Resim ${index + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-64 bg-muted flex items-center justify-center text-muted-foreground">Resim yüklenemedi</div>'
                    }
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-black/20 hover:bg-black/40 text-white border-0"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = imageUrl
                      link.download = `resim-${index + 1}.jpg`
                      link.target = '_blank'
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    İndir
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {images.length} resim • Büyütmek için tıklayın
      </p>
    </div>
  )
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
          {renderContent(message.content)}
          
          {/* Resim galerisi - sadece bot mesajlarında göster */}
          {isBot && message.images && message.images.length > 0 && (
            <ImageGallery images={message.images} />
          )}
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

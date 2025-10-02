"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { ChatWelcome } from "./chat-welcome";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "./chat-message";

interface ChatbotProps {
  sessionId?: string;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  className?: string;
  ratingStyle?: "stars" | "thumbs";
  mode?: "card" | "full" | "embed";
  title?: string;
  logoUrl?: string;
}

export function Chatbot({
  sessionId: initialSessionId, // <-- bu kalsın, fetchHistory için
  isMinimized = false,
  onMinimize,
  onClose,
  className,
  ratingStyle = "thumbs",
  mode = "card",
  title = "AI Asistanınız",
  logoUrl,
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const [shownImages, setShownImages] = useState<Set<string>>(new Set());

  // Tasarımsal düzen: full/embed/card modlarına göre tutarlı layout
  const layout = useMemo(() => {
    if (mode === "full") {
      return {
        outer: "fixed inset-0 z-40 flex flex-col bg-background",
        header: "px-4 py-3 border-b bg-[#a8cc44] text-white",
        bodyWrapper: "flex-1 min-h-0 flex flex-col",
        body: "flex-1 min-h-[60vh] max-h-[calc(100dvh-180px)]",
        inputWrap:
          "sticky bottom-0 left-0 right-0 border-t p-2 sm:p-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      };
    }
    if (mode === "embed") {
      return {
        outer: "w-full h-full flex flex-col bg-background",
        header: "px-4 py-3 border-b bg-[#a8cc44] text-white",
        bodyWrapper: "flex-1 min-h-0 flex flex-col",
        body: "flex-1 min-h-[60vh] max-h-[calc(100dvh-180px)]",
        inputWrap:
          "sticky bottom-0 left-0 right-0 border-t p-2 sm:p-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      };
    }
    // card modu
    return {
      outer: cn(
        "w-full max-w-4xl mx-auto shadow-xl border-0 bg-background/95 backdrop-blur-sm",
        className
      ),
      header:
        "flex items-center justify-between p-4 border-b bg-[#a8cc44] text-white rounded-t-lg",
      bodyWrapper: "flex flex-col",
      body: "flex-1 min-h-[60vh] max-h-[calc(100dvh-180px)]",
      inputWrap:
        "sticky bottom-0 left-0 right-0 border-t p-2 sm:p-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    };
  }, [mode, className]);

  // Chat geçmişini getir (mevcut mantık korunuyor)
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ action: "get_history", sessionId: initialSessionId }),
      });
      const data = await res.json();
      if (data?.sessionConversation) setMessages(data.sessionConversation);
    } catch (e) {
      console.error("[chatbot] fetch history error:", e);
    } finally {
      setIsReady(true);
    }
  }, [initialSessionId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Mesaj gönder (geliştirilmiş UX için)
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return;
      setIsLoading(true);

      const userMessage = {
        id: uuidv4(),
        content,
        role: "user" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // İlk mesajda threadId gönderme!
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify(
            threadId
              ? { message: content, threadId }
              : { message: content }
          ),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        // Backend'den dönen threadId'yi kaydet
        if (data?.threadId && data.threadId.startsWith("thread_")) {
          setThreadId(data.threadId);
        }

        // Bot mesajı ekle
        if (data?.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              content: data.message,
              role: "assistant",
              timestamp: new Date(),
              // images, rating vs. eklenebilir
            },
          ]);
        }
      } catch (e) {
        console.error("[chatbot] send error:", e);
        setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [threadId, isLoading]
  );

  // Rating değişikliği için handler
  const handleRatingChange = (messageId: string, rating: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, rating } : msg
      )
    );
  };

  // Reset
  const handleReset = useCallback(() => {
    setThreadId(undefined); // <-- sadece threadId sıfırlanacak
    setMessages([]);
    setShownImages(new Set());
    setIsReady(false);
    fetchHistory();
  }, [fetchHistory]);

  const handleSuggestionClick = useCallback(
    (s: string) => handleSendMessage(s),
    [handleSendMessage]
  );

  const Wrapper: React.ElementType = mode === "card" ? Card : "div";

  return (
    <Wrapper className={layout.outer}>
      {/* Header */}
      <div className={cn("flex items-center justify-between", layout.header)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="logo"
                className="w-10 h-10 object-contain"
              />
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{title}</h2>
            {/* String hatası düzeltildi ve ikinci versiyonun header stili korundu */}
            <p className="text-sm text-white/80">
              {messages.length > 0
                ? "Sohbet hazır"
                : "Size yardımcı olmaya hazır"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
            onClick={handleReset}
            title="Sohbeti sıfırla"
            aria-label="Sohbeti sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Tema değiştir butonu */}
          <ThemeToggleButton />

          {onMinimize && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-white hover:bg-white/20"
              onClick={onMinimize}
              title="Küçült"
              aria-label="Küçült"
            >
              —
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-white hover:bg-white/20"
              onClick={onClose}
              title="Kapat"
              aria-label="Kapat"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* İçerik */}
      <div className={layout.bodyWrapper}>
        <div className={cn("overflow-y-auto", layout.body)}>
          {messages.length === 0 ? (
            <ChatWelcome onSuggestionClick={handleSuggestionClick} />
          ) : (
            <ChatMessageList
              messages={messages}
              onRatingChange={handleRatingChange}
              isLoading={isLoading}
              ratingStyle={ratingStyle}
            />
          )}
        </div>

        <div className={layout.inputWrap}>
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading || !isReady}
            placeholder="Mesajınızı yazın..."
          />
        </div>
      </div>
    </Wrapper>
  );
}

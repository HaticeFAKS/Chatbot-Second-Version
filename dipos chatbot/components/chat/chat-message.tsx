"use client";

import React from "react";
import { MessageRating } from "./message-rating";
import { QuickRating } from "./quick-rating";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  rating?: number;
  images?: string[];
}

interface ChatMessageProps {
  message: Message;
  ratingStyle?: "stars" | "quick";
  onRatingChange: (messageId: string, rating: number) => void;
}

export function ChatMessage({
  message,
  ratingStyle = "stars",
  onRatingChange,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex w-full mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%] px-4 py-3 rounded-xl shadow-md
          ${isUser
            ? "bg-[#a8cc44] dark:bg-[#8fb83a] text-white rounded-br-none"
            : "bg-white dark:bg-[#a8cc44]/10 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-[#a8cc44]/30 rounded-bl-none"}
        `}
      >
        <div className="text-sm whitespace-pre-line">{message.content}</div>
        <div className={`text-xs mt-1 ${isUser ? "text-green-100 dark:text-green-200" : "text-gray-500 dark:text-gray-400"}`}>
          {message.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </div>
        {/* Bot mesajlarında rating */}
        {isAssistant && (
          <div className="mt-2">
            {ratingStyle === "stars" ? (
              <MessageRating
                messageId={message.id}
                currentRating={message.rating ?? 0}
                onRatingChange={onRatingChange}
                disabled={message.rating !== undefined && message.rating > 0}
              />
            ) : (
              <QuickRating
                messageId={message.id}
                currentRating={message.rating ?? 0}
                onRatingChange={onRatingChange}
                disabled={message.rating !== undefined && message.rating > 0}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

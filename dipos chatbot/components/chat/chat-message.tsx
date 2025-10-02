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
          max-w-[80%] px-4 py-3 rounded-xl shadow
          ${isUser
            ? "bg-[#a8cc44] text-white rounded-br-none"
            : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"}
        `}
      >
        <div className="text-sm whitespace-pre-line">{message.content}</div>
        <div className={`text-xs mt-1 ${isUser ? "text-green-100" : "text-gray-500"}`}>
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
                disabled={false}
              />
            ) : (
              <QuickRating
                messageId={message.id}
                currentRating={message.rating ?? 0}
                onRatingChange={onRatingChange}
                disabled={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, Message } from "./chat-message";

interface ChatMessageListProps {
  messages: Message[];
  onRatingChange: (messageId: string, rating: number) => void;
  isLoading: boolean;
  ratingStyle?: "stars" | "thumbs";
  
}

export function ChatMessageList({ messages, isLoading, onRatingChange }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-700">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 opacity-70 rounded-full bg-[#a8cc44]" />
            <p className="text-lg font-semibold text-gray-800">ChatBot'a Hoş Geldiniz</p>
            <p className="text-sm mt-2 text-gray-600">Sohbeti başlatmak için bir mesaj yazın</p>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onRatingChange={onRatingChange} />
        ))
      )}

      {isLoading && (
        <div className="flex gap-3 p-4 rounded-lg max-w-3xl mr-auto bg-white border border-gray-200 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#a8cc44]" />
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-gray-700">Düşünülüyor...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessageList;

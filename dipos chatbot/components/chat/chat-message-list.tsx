"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, Message } from "./chat-message";
import { ChatTypingIndicator } from "./chat-typing-indicator";

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
        <div className="flex items-center justify-center h-full text-foreground">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 opacity-70 rounded-full bg-[#a8cc44] dark:bg-[#8fb83a]" />
            <p className="text-lg font-semibold text-foreground">ChatBot'a Hoş Geldiniz</p>
            <p className="text-sm mt-2 text-muted-foreground">Sohbeti başlatmak için bir mesaj yazın</p>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onRatingChange={onRatingChange} />
        ))
      )}

      {isLoading && (
        <ChatTypingIndicator isVisible={true} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessageList;

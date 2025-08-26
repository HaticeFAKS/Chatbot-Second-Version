"use client"

import { Card } from "@/components/ui/card"
import { MascotAvatar } from "@/components/chat/mascot-avatar"


interface ChatTypingIndicatorProps {
  isVisible?: boolean
  message?: string
}

export function ChatTypingIndicator({ isVisible = false, message = "" }: ChatTypingIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className="flex gap-3 max-w-4xl mx-auto px-4 py-3 animate-fade-in">
      {/* Bot Avatar */}
    
<MascotAvatar state="typing" size={40} />

 <Card className="px-3 py-2 border border-sage-200/70 dark:border-sage-800/70 bg-sage-50/90 dark:bg-sage-950/50">
  <div className="flex items-center gap-1">
    <span className="h-2 w-2 rounded-full bg-[#a8cc44] dark:bg-[#8fb83a] animate-bounce [animation-delay:-.2s]"></span>
     <span className="h-2 w-2 rounded-full bg-[#a8cc44] dark:bg-[#8fb83a] animate-bounce"></span>
    <span className="h-2 w-2 rounded-full bg-[#a8cc44] dark:bg-[#8fb83a] animate-bounce [animation-delay:.2s]"></span>
  </div>
 </Card>
      </div>
  )
}

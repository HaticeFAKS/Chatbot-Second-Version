"use client"

import { Chatbot } from "@/components/chat/chatbot"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="h-full">
          <Chatbot
            ratingStyle="stars"
            mode="embed"
            title="Dipos IV Yapay Zeka Asistanı"
            logoUrl="/co-pilot.gif"
          />
        </div>
      </main>
    </div>
  )
}

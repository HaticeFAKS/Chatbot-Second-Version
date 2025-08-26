"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, systemTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const effective = theme === "system" ? systemTheme : theme
  const isDark = effective === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Karanlık/Aydınlık"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("w-8 h-8 p-0 text-white hover:bg-white/20", className)}
      title={isDark ? "Aydınlık moda geç" : "Karanlık moda geç"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  )
}

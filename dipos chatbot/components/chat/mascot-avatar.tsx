"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

type MascotState = "idle" | "typing" | "success" | "error"

export function MascotAvatar({
  state = "idle",
  size = 40,
  className,
}: { state?: MascotState; size?: number; className?: string }) {
  // typing’de hafif nefes efekti
  const anim = useMemo(
    () =>
      state === "typing"
        ? "animate-[breath_1.6s_ease-in-out_infinite]"
        : undefined,
    [state]
  )

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shadow-md",
        anim,
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="co-pilot.gif"
        alt="Asistan"
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized
        priority
      />

      {/* küçük durum rozeti (opsiyonel) */}
      {state === "success" && (
        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white text-[10px] grid place-items-center shadow">
          ✓
        </span>
      )}
      {state === "error" && (
        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] grid place-items-center shadow">
          !
        </span>
      )}
    </div>
  )
}

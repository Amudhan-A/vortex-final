"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { motion } from "motion/react"

type BadgeVariant = "default" | "owner" | "match" | "new" | "live"

interface AnimatedBadgeProps {
  text?: string
  variant?: BadgeVariant
  href?: string
  color?: string
}

const variantMap: Record<BadgeVariant, { color: string; label: string }> = {
  default: { color: "#4ec9b0", label: "" },
  owner:   { color: "#4ec9b0", label: "primary owner" },
  match:   { color: "#4ec9b0", label: "match found" },
  new:     { color: "#dcdcaa", label: "new analysis" },
  live:    { color: "#f48771", label: "live" },
}

export function AnimatedBadge({
  text,
  variant = "default",
  href,
  color: colorOverride,
}: AnimatedBadgeProps) {
  const { color: variantColor, label } = variantMap[variant]
  const color = colorOverride ?? variantColor
  const displayText = text ?? label

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 2, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group inline-flex items-center gap-2 rounded-sm border border-[#3e3e42] bg-[#1e1e1e] px-2 py-[3px] transition-colors hover:border-[#4ec9b0]/30"
    >
      {/* Ping dot */}
      <div className="relative flex items-center justify-center shrink-0 w-2 h-2">
        <div
          className="h-1.5 w-1.5 animate-ping rounded-full absolute opacity-40"
          style={{ backgroundColor: color }}
        />
        <div
          className="h-1.5 w-1.5 rounded-full relative"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Divider */}
      <div className="h-3 w-px bg-[#3e3e42]" />

      {/* Text */}
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
        {displayText}
      </span>

      {href && (
        <ChevronRight
          size={11}
          className="text-[#6b6b6b] transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </motion.div>
  )

  return href ? (
    <Link href={href} className="inline-block">{content}</Link>
  ) : content
}

export default AnimatedBadge
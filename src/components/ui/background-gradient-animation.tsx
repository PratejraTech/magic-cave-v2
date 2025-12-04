"use client"

import React, { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string
  gradientBackgroundEnd?: string
  firstColor?: string
  secondColor?: string
  thirdColor?: string
  fourthColor?: string
  fifthColor?: string
  sixthColor?: string
  pointerColor?: string
  size?: string
  blendingValue?: string
  children?: React.ReactNode
  className?: string
  interactive?: boolean
  containerClassName?: string
}

export const BackgroundGradientAnimation: React.FC<BackgroundGradientAnimationProps> = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  sixthColor = "139, 92, 246",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null)

  const updateMousePosition = (event: MouseEvent) => {
    if (!interactiveRef.current || !interactive) return

    const { clientX, clientY } = event
    const rect = interactiveRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    interactiveRef.current.style.setProperty("--mouse-x", `${x}px`)
    interactiveRef.current.style.setProperty("--mouse-y", `${y}px`)
  }

  useEffect(() => {
    if (interactive) {
      document.addEventListener("mousemove", updateMousePosition)
      return () => document.removeEventListener("mousemove", updateMousePosition)
    }
  }, [interactive])

  return (
    <div
      className={cn(
        "h-full w-full absolute inset-0",
        containerClassName
      )}
    >
      {/* Primary interactive gradient layer */}
      <div
        className={cn(
          "h-full w-full opacity-50 animate-gradient-x",
          className
        )}
        style={
          {
            background: `radial-gradient(${size} circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(${pointerColor}, 0.8), transparent 50%)`,
            filter: `blur(80px)`,
            mixBlendMode: blendingValue as any,
          } as React.CSSProperties
        }
      />

      {/* Secondary animated layer */}
      <div
        className={cn(
          "h-full w-full absolute inset-0 opacity-40 animate-gradient-xy",
          className
        )}
        style={
          {
            background: `conic-gradient(from 0deg at 50% 50%, rgba(${firstColor}, 0.6), rgba(${secondColor}, 0.6), rgba(${thirdColor}, 0.6), rgba(${firstColor}, 0.6))`,
            filter: `blur(100px)`,
            mixBlendMode: 'screen' as any,
          } as React.CSSProperties
        }
      />

      <div
        className={cn(
          "h-full w-full absolute inset-0 opacity-60 animate-gradient-x",
          className
        )}
        style={
          {
            background: `radial-gradient(${size} circle at 20% 80%, ${firstColor}, transparent 50%),
            radial-gradient(${size} circle at 80% 20%, ${secondColor}, transparent 50%),
            radial-gradient(${size} circle at 40% 40%, ${thirdColor}, transparent 50%)`,
            backgroundSize: `${size} ${size}`,
          } as React.CSSProperties
        }
      />

      <div
        className={cn(
          "h-full w-full absolute inset-0 opacity-60 animate-gradient-xy",
          className
        )}
        style={
          {
            background: `radial-gradient(${size} circle at 20% 80%, ${fourthColor}, transparent 50%),
            radial-gradient(${size} circle at 80% 20%, ${fifthColor}, transparent 50%),
            radial-gradient(${size} circle at 40% 40%, ${sixthColor}, transparent 50%)`,
            backgroundSize: `${size} ${size}`,
          } as React.CSSProperties
        }
      />

      <div
        className={cn(
          "h-full w-full absolute inset-0 opacity-70",
          className
        )}
        style={
          {
            background: `linear-gradient(45deg, ${gradientBackgroundStart}, ${gradientBackgroundEnd})`,
          } as React.CSSProperties
        }
      />

      <div
        ref={interactiveRef}
        className={cn(
          "h-full w-full absolute inset-0 opacity-30",
          className
        )}
        style={
          {
            background: `radial-gradient(${size} circle at var(--mouse-x, 100px) var(--mouse-y, 100px), ${pointerColor}, transparent 40%)`,
            filter: `blur(60px)`,
            mixBlendMode: blendingValue as any,
          } as React.CSSProperties
        }
      />

      {children}
    </div>
  )
}
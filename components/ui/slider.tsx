import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)]
      onValueChange?.(newValue)
    }

    return (
      <input
        type="range"
        className={cn(
          "w-full h-2 bg-[#1a4d3a] rounded-lg appearance-none cursor-pointer accent-gold relative z-10",
          className
        )}
        ref={ref}
        value={value[0]}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }



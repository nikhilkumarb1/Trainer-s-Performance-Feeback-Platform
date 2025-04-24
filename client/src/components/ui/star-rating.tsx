import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  onHoverChange?: (name: string | null) => void;
  name?: string;
  size?: "sm" | "md" | "lg";
  max?: number;
  disabled?: boolean;
}

export function StarRating({
  value,
  onChange,
  onHoverChange,
  name,
  size = "md",
  max = 5,
  disabled = false,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  
  const handleClick = (rating: number) => {
    if (disabled) return;
    // Toggle off if clicking the same star
    onChange(value === rating ? 0 : rating);
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div 
      className="flex"
      onMouseEnter={() => onHoverChange && onHoverChange(name || "")}
      onMouseLeave={() => onHoverChange && onHoverChange(null)}
    >
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className={cn(
            "focus:outline-none transition hover:scale-110",
            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          )}
          disabled={disabled}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "text-slate-300 transition-colors",
              star <= value && "text-amber-400 fill-amber-400"
            )}
          />
        </button>
      ))}
    </div>
  );
}

import React from "react";
import { cn } from "../../lib/utils";

type AvatarProps = {
  /**
   * Text to generate avatar from (uses first 2 characters)
   */
  text: string;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Optional className
   */
  className?: string;
};

/**
 * Avatar component that generates colorful initials from text.
 *
 * :param str text: Text to generate avatar from
 * :param str size: Size variant (sm, md, lg, xl)
 * :param str className: Additional CSS classes
 */
export function Avatar({ text, size = "md", className = "" }: AvatarProps) {
  // Get first 2 characters (or 1 if only 1 word)
  const getInitials = (str: string): string => {
    const words = str.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  // Generate consistent color from string (hash function)
  const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate nice gradient colors
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-orange-500",
      "from-red-500 to-pink-500",
      "from-indigo-500 to-purple-500",
      "from-teal-500 to-green-500",
      "from-orange-500 to-red-500",
      "from-cyan-500 to-blue-500",
      "from-pink-500 to-rose-500",
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(text);
  const gradient = stringToColor(text);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-2xl",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br text-white font-bold shadow-sm",
        gradient,
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}

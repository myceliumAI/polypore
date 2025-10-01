import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "danger" | "ghost" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

/**
 * Reusable button component with different variants.
 *
 * :param ButtonVariant variant: Button style (primary, danger, ghost, secondary)
 * :param ReactNode children: Button content
 * :return JSX.Element: Styled button
 */
export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 active:from-purple-800 active:to-blue-800 shadow-sm",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    ghost:
      "bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700",
    secondary:
      "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

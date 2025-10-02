import React, { ReactNode } from "react";

type AlertProps = {
    variant?: "error" | "warning" | "success" | "info";
    children: ReactNode;
    onClose?: () => void;
    className?: string;
};

export function Alert({ variant = "info", children, onClose, className = "" }: AlertProps) {
    const styles = {
        error:
            "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
        warning:
            "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
        success:
            "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
        info:
            "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    } as const;

    const emoji = {
        error: "❌",
        warning: "⚠️",
        success: "✅",
        info: "💡",
    } as const;

    return (
        <div
            className={`border rounded-lg p-4 text-sm flex items-start justify-between gap-3 ${styles[variant]} ${className}`}
            role="alert"
        >
            <div className="flex items-start gap-2">
                <span aria-hidden>{emoji[variant]}</span>
                <div>{children}</div>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 text-current/70 hover:text-current transition"
                    aria-label="Close alert"
                >
                    ×
                </button>
            )}
        </div>
    );
}



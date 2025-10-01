import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

/**
 * Reusable input component with label and error handling.
 *
 * :param str label: Optional label displayed above the input
 * :param str error: Optional error message displayed in red
 * :return JSX.Element: Styled input with label
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

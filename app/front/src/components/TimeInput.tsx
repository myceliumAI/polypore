import { useState, useRef, useEffect } from "react";

type TimeInputProps = {
  value: string; // Format "HH:mm"
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
};

/**
 * Time input component with dropdown selectors for hours and minutes.
 *
 * :param str value: Current time value in "HH:mm" format
 * :param function onChange: Callback when time changes
 * :param str label: Optional label
 * :param bool required: Whether the field is required
 */
export function TimeInput({
  value,
  onChange,
  label,
  required = false,
}: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Parse current time
  const [hours, minutes] = value ? value.split(":") : ["09", "00"];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    onChange(`${newHours}:${newMinutes}`);
  };

  // Generate hours and minutes options
  const hoursOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutesOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2.5 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {hours}:{minutes}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-700">
            {/* Hours */}
            <div className="w-32">
              <div className="p-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 text-center">
                Hours
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {hoursOptions.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      handleTimeChange(hour, minutes);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                      hour === hours
                        ? "bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 font-semibold"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="w-32">
              <div className="p-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 text-center">
                Minutes
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {minutesOptions.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => {
                      handleTimeChange(hours, minute);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                      minute === minutes
                        ? "bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 font-semibold"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

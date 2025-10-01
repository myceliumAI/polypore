import { useState, useRef, useEffect } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { fr } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { formatShortDate } from "../lib/utils";
import { TimeInput } from "./TimeInput";

type DateRangePickerProps = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
};

export function DateRangePicker({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"start" | "end" | null>(
    null,
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedInput(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    onStartDateChange(selection.startDate);
    onEndDateChange(selection.endDate);

    // Close when both dates are selected
    if (
      selection.startDate &&
      selection.endDate &&
      selection.startDate.getTime() !== selection.endDate.getTime()
    ) {
      setIsOpen(false);
      setFocusedInput(null);
    }
  };

  const formatDateDisplay = (date: Date | undefined) => {
    return date ? formatShortDate(date.toISOString()) : "Select";
  };

  const handleStartClick = () => {
    setIsOpen(true);
    setFocusedInput("start");
  };

  const handleEndClick = () => {
    setIsOpen(true);
    setFocusedInput("end");
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Two separate input fields */}
      <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-700">
          {/* Start Date */}
          <button
            type="button"
            onClick={handleStartClick}
            className={`px-4 py-3 text-left transition-all ${
              focusedInput === "start"
                ? "bg-purple-50 dark:bg-purple-950/20 ring-2 ring-inset ring-purple-500"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Start
            </div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {formatDateDisplay(startDate)}
            </div>
          </button>

          {/* End Date */}
          <button
            type="button"
            onClick={handleEndClick}
            className={`px-4 py-3 text-left transition-all ${
              focusedInput === "end"
                ? "bg-purple-50 dark:bg-purple-950/20 ring-2 ring-inset ring-purple-500"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              End
            </div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {formatDateDisplay(endDate)}
            </div>
          </button>
        </div>
      </div>

      {/* Calendar popup - Airbnb style with react-date-range */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
          <div className="date-range-picker-wrapper border border-neutral-200 dark:border-neutral-700 rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
            {/* @ts-expect-error - react-date-range has type issues with React 18 */}
            <DateRange
              ranges={[
                {
                  startDate: startDate || new Date(),
                  endDate: endDate || new Date(),
                  key: "selection",
                },
              ]}
              onChange={handleSelect}
              months={2}
              direction="horizontal"
              showDateDisplay={false}
              moveRangeOnFirstSelection={false}
              rangeColors={["#7c3aed"]}
              locale={fr}
            />
          </div>
        </div>
      )}

      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <TimeInput
          value={startTime}
          onChange={onStartTimeChange}
          label="Start time"
          required
        />
        <TimeInput
          value={endTime}
          onChange={onEndTimeChange}
          label="End time"
          required
        />
      </div>
    </div>
  );
}

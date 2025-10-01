import { useState, useEffect, useRef } from "react";

type AddressSuggestion = {
  properties: {
    name: string;
    city?: string;
    country?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

type AddressInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

/**
 * Input component with address autocomplete using Photon API (Komoot).
 * Free, open source, no limit and no API key required.
 *
 * :param str value: Current input value
 * :param function onChange: Callback called when value changes
 * :param str placeholder: Placeholder text (optional)
 * :param bool required: Whether the field is required (optional)
 * :param str className: Additional CSS classes (optional)
 */
export function AddressInput({
  value,
  onChange,
  placeholder = "Search for an address...",
  required = false,
  className = "",
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search addresses with debounce
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=fr`,
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("❌ Erreur lors de la recherche d'adresse:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);

    // Debounce: wait 300ms before making the request
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  // Select a suggestion
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const { properties } = suggestion;
    let fullAddress = "";

    // Build the full address
    if (properties.housenumber) fullAddress += properties.housenumber + " ";
    if (properties.street) fullAddress += properties.street + ", ";
    if (properties.city) fullAddress += properties.city;
    if (properties.postcode) fullAddress += " " + properties.postcode;
    if (properties.country) fullAddress += ", " + properties.country;

    onChange(fullAddress.trim() || properties.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Format a suggestion for display
  const formatSuggestion = (suggestion: AddressSuggestion) => {
    const { properties } = suggestion;

    // Build the primary line with street information
    const streetParts = [
      properties.housenumber,
      properties.street || properties.name,
    ].filter(Boolean);

    const primary =
      streetParts.length > 0 ? streetParts.join(" ") : properties.name || "";

    // Build the secondary line with city and country
    const locationParts = [
      properties.postcode,
      properties.city,
      properties.country,
    ].filter(Boolean);

    const secondary = locationParts.join(", ");

    return { primary, secondary };
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => value.length >= 3 && setShowSuggestions(true)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
      />

      {/* Dropdown des suggestions */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Recherche...
            </div>
          ) : (
            suggestions.map((suggestion, index) => {
              const { primary, secondary } = formatSuggestion(suggestion);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
                >
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {primary}
                  </div>
                  {secondary && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {secondary}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

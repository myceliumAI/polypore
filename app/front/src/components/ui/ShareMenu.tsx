import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Modal } from "./Modal";

type ShareOption =
    | "download"
    | "copy"
    | "email"
    | "twitter"
    | "linkedin"
    | "instagram";

type ShareMenuProps = {
    /**
     * Data to be shared/downloaded as CSV
     */
    data: Record<string, string | number>[];
    /**
     * Filename for the CSV download (without .csv extension)
     */
    filename: string;
    /**
     * Text to share (for social media and email)
     */
    shareText?: string;
    /**
     * Optional className for the button
     */
    className?: string;
};

/**
 * Share menu component with CSV download and social sharing options.
 *
 * :param Record[] data: Data to export as CSV
 * :param str filename: Filename for CSV download
 * :param str shareText: Text to share on social media
 * :param str className: Additional CSS classes for the button
 */
export function ShareMenu({
    data,
    filename,
    shareText = "Check this out!",
    className = "",
}: ShareMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    /**
     * Convert data to CSV format
     */
    const generateCSV = (): string => {
        if (data.length === 0) return "";

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(","), // Header row
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header]?.toString() || "";
                        // Escape values that contain commas or quotes
                        return value.includes(",") || value.includes('"')
                            ? `"${value.replace(/"/g, '""')}"`
                            : value;
                    })
                    .join(","),
            ),
        ];

        return csvRows.join("\n");
    };

    /**
     * Download CSV file
     */
    const handleDownload = () => {
        const csv = generateCSV();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsOpen(false);
    };

    /**
     * Copy CSV to clipboard
     */
    const handleCopy = async () => {
        const csv = generateCSV();
        try {
            await navigator.clipboard.writeText(csv);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    /**
     * Share via email
     */
    const handleEmail = () => {
        const subject = encodeURIComponent(shareText);
        const body = encodeURIComponent(
            `${shareText}\n\nData: ${window.location.href}`,
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
        setIsOpen(false);
    };

    /**
     * Share on Twitter
     */
    const handleTwitter = () => {
        const text = encodeURIComponent(shareText);
        const url = encodeURIComponent(window.location.href);
        window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            "_blank",
            "width=550,height=420",
        );
        setIsOpen(false);
    };

    /**
     * Share on LinkedIn
     */
    const handleLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            "_blank",
            "width=550,height=420",
        );
        setIsOpen(false);
    };

    /**
     * Share on Instagram (opens Instagram in new tab)
     */
    const handleInstagram = () => {
        window.open("https://www.instagram.com/", "_blank");
        setIsOpen(false);
    };

    const shareOptions: {
        key: ShareOption;
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
        color?: string;
    }[] = [
            {
                key: "download",
                label: "Download CSV",
                icon: (
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                ),
                onClick: handleDownload,
                color: "text-purple-600 dark:text-purple-400",
            },
            {
                key: "copy",
                label: copied ? "✓ Copied!" : "Copy CSV",
                icon: (
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                ),
                onClick: handleCopy,
                color: copied
                    ? "text-green-600 dark:text-green-400"
                    : "text-blue-600 dark:text-blue-400",
            },
            {
                key: "email",
                label: "Email",
                icon: (
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                ),
                onClick: handleEmail,
                color: "text-gray-600 dark:text-gray-400",
            },
            {
                key: "twitter",
                label: "X (Twitter)",
                icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                ),
                onClick: handleTwitter,
                color: "text-neutral-900 dark:text-neutral-100",
            },
            {
                key: "linkedin",
                label: "LinkedIn",
                icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                ),
                onClick: handleLinkedIn,
                color: "text-blue-700 dark:text-blue-500",
            },
            {
                key: "instagram",
                label: "Instagram",
                icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                ),
                onClick: handleInstagram,
                color: "text-pink-600 dark:text-pink-500",
            },
        ];

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors",
                    className,
                )}
                aria-label="Share options"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                </svg>
                Share
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Export & Share"
            >
                <div className="p-6">
                    {/* Export section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                            Export
                        </h3>
                        <div className="space-y-2">
                            {shareOptions.slice(0, 2).map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={option.onClick}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all",
                                        option.color || "text-neutral-700 dark:text-neutral-300",
                                    )}
                                >
                                    <span className={cn("text-xl", option.color)}>
                                        {option.icon}
                                    </span>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">{option.label}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Social networks section */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                            Share on Social Networks
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {shareOptions.slice(2).map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={option.onClick}
                                    className={cn(
                                        "flex flex-col items-center gap-2 px-4 py-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all",
                                        option.color || "text-neutral-700 dark:text-neutral-300",
                                    )}
                                >
                                    <span className={cn("text-2xl", option.color)}>
                                        {option.icon}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                        {option.label
                                            .replace("Share on ", "")
                                            .replace("X (Twitter)", "X")}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

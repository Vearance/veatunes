/**
 * Converts a duration in seconds to a human-readable string.
 * Examples:
 * - 45 → "0:45"
 * - 125 → "2:05"
 * - 3671 → "1:01:11"
 */
export function formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "0:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const formatted = hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        : `${minutes}:${String(secs).padStart(2, "0")}`

    return formatted
}

/**
 * Converts a duration in seconds to a human-readable string like "1 hr 15 min".
 * Examples:
 * - 45 → "45 sec"
 * - 125 → "2 min 5 sec"
 * - 3671 → "1 hr 1 min 11 sec"
 */
export function formatDurationVerbose(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "0 sec";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];

    if (hrs > 0) parts.push(`${hrs} hr`);
    if (mins > 0) parts.push(`${mins} min`);
    if (secs > 0 && hrs === 0) parts.push(`${secs} sec`);

    return parts.join(" ") || "0 sec";
}

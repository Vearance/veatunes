import ColorThief from "colorthief";

// Reuse a single ColorThief instance to avoid unnecessary instantiation
const colorThief = new ColorThief();

/**
 * Extracts the dominant color from an image URL or HTMLImageElement.
 * Returns it as an RGB string, e.g. "rgb(120, 90, 200)".
 */
export async function extractDominantColor(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;

        img.onload = () => {
            try {
                const [r, g, b] = colorThief.getColor(img);
                resolve(`rgb(${r}, ${g}, ${b})`);
            } catch (err) {
                console.error("Color extraction failed:", err);
                resolve(null);
            }
        };

        img.onerror = () => {
            console.error("Image failed to load:", imageUrl);
            resolve(null);
        };
    });
}

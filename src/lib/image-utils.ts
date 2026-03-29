// colorthief ships Node.js types (standalone functions), but the browser bundle exports a class constructor. Declare the browser interface here.
interface ColorThiefInstance {
    getColor(img: HTMLImageElement, quality?: number): [number, number, number];
    getPalette(img: HTMLImageElement, colorCount?: number, quality?: number): [number, number, number][];
}
interface ColorThiefConstructor {
    new (): ColorThiefInstance;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ColorThief = (await import("colorthief")).default as unknown as ColorThiefConstructor;

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
                const colorThief = new ColorThief();
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

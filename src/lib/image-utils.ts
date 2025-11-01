import ColorThief from "colorthief";

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

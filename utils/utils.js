import fs from "fs";
import { registerFont } from "canvas";

export async function loadGoogleFont(fontFamily) {
    try {
        // Convert font family name to URL format
        const fontQuery = fontFamily.replace(/\s+/g, "+");
        const response = await fetch(`https://fonts.googleapis.com/css2?family=${fontQuery}`);
        const css = await response.text();

        // Extract the font URL from the CSS
        const fontUrlMatch = css.match(/src: url\((.+?)\)/);
        if (!fontUrlMatch) throw new Error("Font source not found");

        // Download the font file
        const fontUrl = fontUrlMatch[1];
        const fontResponse = await fetch(fontUrl);
        const fontBuffer = await fontResponse.arrayBuffer();

        // Generate a temporary file path for the font
        const fontPath = `/tmp/${fontFamily.replace(/\s+/g, "_")}.ttf`;

        // Save the font file
        fs.writeFileSync(fontPath, Buffer.from(fontBuffer));

        // Register the font with node-canvas
        registerFont(fontPath, { family: fontFamily });

        return true;
    } catch (error) {
        console.error(`Error loading font ${fontFamily}:`, error);
        return false;
    }
}

export function magicResize(template, newWidth, newHeight) {
    // Get original dimensions
    const originalWidth = template.width;
    const originalHeight = template.height;

    // Calculate scale factors
    const scaleX = newWidth / originalWidth;
    const scaleY = newHeight / originalHeight;

    // Create deep copy of template
    const resizedTemplate = JSON.parse(JSON.stringify(template));

    // Update template dimensions
    resizedTemplate.width = newWidth;
    resizedTemplate.height = newHeight;

    // Resize all elements in all pages
    resizedTemplate.pages.forEach((page) => {
        page.children.forEach((element) => {
            // For images and SVGs, maintain aspect ratio
            if (element.type === "image" || element.type === "svg") {
                const scale = Math.min(scaleX, scaleY);
                const newElementWidth = element.width * scale;
                const newElementHeight = element.height * scale;

                // Scale position
                element.x *= scaleX;
                element.y *= scaleY;

                // Update dimensions while maintaining aspect ratio
                element.width = newElementWidth;
                element.height = newElementHeight;
            } else {
                // For other elements, scale normally
                element.x *= scaleX;
                element.y *= scaleY;
                element.width *= scaleX;
                element.height *= scaleY;
            }

            // Scale font size if it's a text element
            if (element.type === "text") {
                element.fontSize *= scaleX;
            }

            // Scale other properties that might need scaling
            if (element.shadowBlur) element.shadowBlur *= scaleX;
            if (element.shadowOffsetX) element.shadowOffsetX *= scaleX;
            if (element.shadowOffsetY) element.shadowOffsetY *= scaleY;
            if (element.borderSize) element.borderSize *= scaleX;
            if (element.cornerRadius) element.cornerRadius *= scaleX;
            if (element.blurRadius) element.blurRadius *= scaleX;
        });
    });

    return resizedTemplate;
}

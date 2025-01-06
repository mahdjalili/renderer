import Konva from "konva";
import { createCanvas as createCanvasNapi, loadImage as loadImageNapi } from "@napi-rs/canvas";
import { createCanvas as createCanvasCanvas, loadImage as loadImageCanvas, registerFont } from "canvas";

import fetch from "node-fetch";

import { log } from "../utils/logger";

export const loadSVG = async (svgData: string) => {
    const svg = new DOMParser().parseFromString(svgData, "image/svg+xml");
    return svg;
};

export function replaceSvgColors(svgString: string, colorsReplace: Record<string, string>) {
    let modifiedSvgString = svgString;
    if (colorsReplace) {
        Object.entries(colorsReplace).forEach(([fromColor, toColor]) => {
            // Create a regex to match the color, accounting for possible spaces
            const colorRegex = new RegExp(fromColor.replace(/[()]/g, "\\$&").replace(/\s+/g, "\\s*"), "g");
            modifiedSvgString = modifiedSvgString.replace(colorRegex, toColor);
        });
    }
    return modifiedSvgString;
}

export async function loadGoogleFont(fontFamily: string) {
    try {
        // Convert font family name to URL format
        let fontPath = `./tmp/${fontFamily.replace(/\s+/g, "_")}.ttf`;

        if (!(await Bun.file(fontPath).exists())) {
            const fontQuery = fontFamily.replace(/\s+/g, "+");
            const response = await fetch(`https://fonts.googleapis.com/css2?family=${fontQuery}`);
            const css = await response.text();

            // Extract the font URL from the CSS
            const fontUrlMatch = css.match(/src: url\((.+?)\)/);
            if (!fontUrlMatch) throw new Error("Font source not found");

            // Download the font file
            const fontUrl = fontUrlMatch[1];
            const fontResponse = await fetch(fontUrl);

            await Bun.write(fontPath, await fontResponse.blob());

            // Register the font with node-canvas
        }
        registerFont(fontPath, { family: fontFamily });

        return true;
    } catch (error) {
        console.error(`Error loading font ${fontFamily}:`, error);
        return false;
    }
}

export const applyMask = async (source: string, mask: string) => {
    try {
        // Load both images from base64
        const sourceImage = await postImageProcessing(source);
        const maskImage = await postImageProcessing(mask);

        // Create canvas with source dimensions
        const canvas = createCanvasCanvas(sourceImage.width, sourceImage.height);
        const ctx = canvas.getContext("2d");

        // Draw the source image
        ctx.drawImage(sourceImage, 0, 0);

        // Create separate canvas for mask processing
        const maskCanvas = createCanvasCanvas(maskImage.width, maskImage.height);
        const maskCtx = maskCanvas.getContext("2d");

        // Draw and process the mask
        maskCtx.drawImage(maskImage, 0, 0);
        const maskData = maskCtx.getImageData(0, 0, maskImage.width, maskImage.height);
        const data = maskData.data;

        // Convert mask to alpha channel
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i + 3] = brightness;
        }

        maskCtx.putImageData(maskData, 0, 0);

        // Apply mask to source image
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskCanvas, 0, 0);

        // Return result as base64
        return canvas.toDataURL();
    } catch (error) {
        console.error("Error applying mask:", error);
        return source; // Return original image if masking fails
    }
};

export const postImageProcessing = async (image: string) => {
    if (image.startsWith("data:")) {
        // Handle base64 encoded images
        const base64Data = image.split(",")[1];
        const imageBuffer = Buffer.from(base64Data, "base64");
        return await loadImageCanvas(imageBuffer);
    } else {
        // Handle URL-based images
        const response = await fetch(image);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return await loadImageCanvas(buffer);
    }
};

export async function renderTemplate(template: any): Promise<string> {
    const stage = new Konva.Stage({
        width: template.width,
        height: template.height,
    });

    const layer = new Konva.Layer();
    const page = template.pages[0];

    const background = new Konva.Rect({
        x: 0,
        y: 0,
        width: template.width,
        height: template.height,
        fill: page.background,
    });
    layer.add(background);

    for (const element of page.children) {
        switch (element.type.toLowerCase()) {
            case "text":
                // Load font if it's not already loaded
                if (element.fontFamily) {
                    await loadGoogleFont(element.fontFamily);
                }

                const text = new Konva.Text({ ...element });
                layer.add(text);
                break;

            case "image":
                try {
                    let image;
                    if (element.mask) {
                        image = await postImageProcessing(await applyMask(element.src, element.mask));
                    } else {
                        image = await postImageProcessing(element.src);
                    }

                    const imageNode = new Konva.Image({ ...element, image });
                    layer.add(imageNode);
                } catch (error: any) {
                    log.error(`Error loading image:`, error.message);
                }
                break;

            case "svg":
                try {
                    // Decode base64 SVG data to string
                    const svgString = Buffer.from(element.src.split(",")[1], "base64").toString("utf-8");

                    // Replace colors if colorsReplace is defined
                    const modifiedSvgString = replaceSvgColors(svgString, element.colorsReplace);

                    // Add width and height to SVG string if not present
                    let finalSvgString = modifiedSvgString;
                    if (!finalSvgString.includes("width=") || !finalSvgString.includes("height=")) {
                        // Use a high resolution for better quality (2x the display size)
                        const width = element.width * 2;
                        const height = element.height * 2;
                        finalSvgString = finalSvgString.replace("<svg", `<svg width="${width}" height="${height}"`);
                    }

                    // Convert modified SVG back to buffer
                    const svgData = Buffer.from(finalSvgString);
                    const image = await loadImageNapi(svgData);

                    const canvas = createCanvasNapi(image.width, image.height);
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0, image.width, image.height);

                    const svgNode = new Konva.Image({
                        ...element,
                        image: (await loadImageCanvas(canvas.encodeSync("png"))) as unknown as HTMLImageElement,
                    });
                    layer.add(svgNode);
                } catch (err: any) {
                    console.error(`Failed to load SVG: ${err}`);
                }
                break;

            case "figure":
                const figure = new Konva.Rect({ ...element });
                layer.add(figure);
                break;
        }
    }
    stage.add(layer);

    const canvas = stage.toCanvas();
    return canvas.toDataURL();
}

import Konva from "konva";
import { createCanvas as createCanvasNapi, loadImage as loadImageNapi } from "@napi-rs/canvas";
import { createCanvas as createCanvasCanvas, loadImage as loadImageCanvas, registerFont } from "canvas";

import fetch from "node-fetch";

import { log } from "../utils/logger";

export const loadSVG = async (svgData: string) => {
    const svg = new DOMParser().parseFromString(svgData, "image/svg+xml");
    return svg;
};

export const validUrl = (url: string) => {
    return url.startsWith("http") || url.startsWith("data:image/");
};

export function replaceSvgColors(svgString: string, colorsReplace: Record<string, string>) {
    // log.info(colorsReplace);
    // log.info(svgString);
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
        // Define common font weights to load
        const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

        for (const weight of weights) {
            let fontPath = `./tmp/${fontFamily.replace(/\s+/g, "_")}_${weight}.ttf`;

            if (!(await Bun.file(fontPath).exists())) {
                const fontQuery = `${fontFamily.replace(/\s+/g, "+")}:wght@${weight}`;
                const response = await fetch(`https://fonts.googleapis.com/css2?family=${fontQuery}`);
                const css = await response.text();

                // Extract the font URL from the CSS
                const fontUrlMatch = css.match(/src: url\((.+?)\)/);
                if (!fontUrlMatch) continue; // Skip this weight if not found

                // Download the font file
                const fontUrl = fontUrlMatch[1];
                const fontResponse = await fetch(fontUrl);

                await Bun.write(fontPath, await fontResponse.blob());
            }

            // Register each font weight
            registerFont(fontPath, {
                family: fontFamily,
                weight: weight.toString(),
            });
        }

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

function calculateObjectFit(
    imgWidth: number,
    imgHeight: number,
    containerWidth: number,
    containerHeight: number,
    objectFit: "contain" | "cover" | "fill" = "contain"
) {
    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = imgWidth / imgHeight;

    let width = containerWidth;
    let height = containerHeight;

    switch (objectFit) {
        case "contain":
            if (imageAspectRatio > containerAspectRatio) {
                height = width / imageAspectRatio;
            } else {
                width = height * imageAspectRatio;
            }
            break;

        case "cover":
            if (imageAspectRatio > containerAspectRatio) {
                width = height * imageAspectRatio;
            } else {
                height = width / imageAspectRatio;
            }
            break;

        case "fill":
            // Use container dimensions directly
            break;
    }

    return { width, height };
}

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
                if (!validUrl(element.src)) {
                    log.error(`Invalid image URL or Data: ${element.src}`);
                    break;
                }
                try {
                    let originalImage = await postImageProcessing(element.src);

                    const tempCanvas = createCanvasCanvas(element.width, element.height);
                    const tempCtx = tempCanvas.getContext("2d");

                    const fitDimensions = calculateObjectFit(
                        originalImage.width,
                        originalImage.height,
                        element.width,
                        element.height,
                        element.objectFit || "contain"
                    );

                    tempCtx.drawImage(
                        originalImage,
                        (element.width - fitDimensions.width) / 2, // center horizontally
                        (element.height - fitDimensions.height) / 2, // center vertically
                        fitDimensions.width,
                        fitDimensions.height
                    );

                    let finalImage;
                    if (element.mask) {
                        finalImage = await postImageProcessing(await applyMask(tempCanvas.toDataURL(), element.mask));
                    } else {
                        finalImage = await postImageProcessing(tempCanvas.toDataURL());
                    }

                    const imageNode = new Konva.Image({
                        ...element,
                        image: finalImage,
                        width: element.width,
                        height: element.height,
                    });
                    layer.add(imageNode);
                } catch (error: any) {
                    log.error(`Error loading image:`, error.message);
                }
                break;

            case "svg":
                if (!validUrl(element.src)) {
                    log.error(`Invalid SVG URL or Data: ${element.src}`);
                    break;
                }
                try {
                    const svgString = Buffer.from(element.src.split(",")[1], "base64").toString("utf-8");
                    const modifiedSvgString = replaceSvgColors(svgString, element.colorsReplace);

                    let finalSvgString = modifiedSvgString;
                    if (!finalSvgString.includes("width=") || !finalSvgString.includes("height=")) {
                        const width = element.width * 2;
                        const height = element.height * 2;
                        finalSvgString = finalSvgString.replace("<svg", `<svg width="${width}" height="${height}"`);
                    }

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

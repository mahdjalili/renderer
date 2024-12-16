import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadImage as loadImageCanvas, registerFont } from "canvas";
import Konva from "konva";
import fetch from "node-fetch";
import { replaceSvgColors } from "./svg.js";

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

export async function renderTemplate(template: any): Promise<string> {
    // Create stage with template dimensions
    const stage = new Konva.Stage({
        width: template.width,
        height: template.height,
        // container: document.createElement("div"), // This won't be used in Node.js
    });

    // Create main layer
    const layer = new Konva.Layer();

    // Get the first page (assuming single page design)
    const page = template.pages[0];

    // Set background
    const background = new Konva.Rect({
        x: 0,
        y: 0,
        width: template.width,
        height: template.height,
        fill: page.background,
    });
    layer.add(background);

    // Process each element in the template
    for (const element of page.children) {
        switch (element.type.toLowerCase()) {
            case "text":
                // Load font if it's not already loaded
                if (element.fontFamily) {
                    await loadGoogleFont(element.fontFamily);
                }

                const text = new Konva.Text({
                    id: element.id,
                    name: element.name,
                    x: element.x,
                    y: element.y,
                    text: element.text,
                    placeholder: element.placeholder,
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    fontStyle: element.fontStyle,
                    fontWeight: element.fontWeight,
                    textDecoration: element.textDecoration,
                    letterSpacing: element.letterSpacing,
                    lineHeight: element.lineHeight,
                    strokeWidth: element.strokeWidth,
                    stroke: element.stroke,
                    fill: element.fill,
                    width: element.width,
                    height: element.height,
                    align: element.align,
                    verticalAlign: element.verticalAlign,
                    rotation: element.rotation,
                    opacity: element.opacity,
                    visible: element.visible,
                    draggable: element.draggable,
                    selectable: element.selectable,
                    removable: element.removable,
                    alwaysOnTop: element.alwaysOnTop,
                    showInExport: element.showInExport,
                    resizable: element.resizable,
                    contentEditable: element.contentEditable,
                    styleEditable: element.styleEditable,

                    // Shadow properties
                    shadowEnabled: element.shadowEnabled,
                    shadowBlur: element.shadowBlur,
                    shadowOffsetX: element.shadowOffsetX,
                    shadowOffsetY: element.shadowOffsetY,
                    shadowColor: element.shadowColor,
                    shadowOpacity: element.shadowOpacity,

                    // Filter properties
                    blurEnabled: element.blurEnabled,
                    blurRadius: element.blurRadius,
                    brightnessEnabled: element.brightnessEnabled,
                    brightness: element.brightness,
                    sepiaEnabled: element.sepiaEnabled,
                    grayscaleEnabled: element.grayscaleEnabled,

                    // Background properties
                    backgroundEnabled: element.backgroundEnabled,
                    backgroundColor: element.backgroundColor,
                    backgroundOpacity: element.backgroundOpacity,
                    backgroundCornerRadius: element.backgroundCornerRadius,
                    backgroundPadding: element.backgroundPadding,
                });
                layer.add(text);
                break;

            case "image":
                try {
                    let image;
                    if (element.src.startsWith("data:")) {
                        // Handle base64 encoded images
                        const base64Data = element.src.split(",")[1];
                        const imageBuffer = Buffer.from(base64Data, "base64");
                        image = await loadImageCanvas(imageBuffer);
                    } else {
                        // Handle URL-based images
                        const response = await fetch(element.src);
                        console.log(response);
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        image = await loadImageCanvas(buffer);
                    }


                    const imageNode = new Konva.Image({
                        id: element.id,
                        name: element.name,
                        x: element.x,
                        y: element.y,
                        image: image as unknown as HTMLImageElement,
                        width: element.width,
                        height: element.height,
                        rotation: element.rotation,
                        opacity: element.opacity,
                        visible: element.visible,
                        draggable: element.draggable,
                        selectable: element.selectable,
                        removable: element.removable,
                        alwaysOnTop: element.alwaysOnTop,
                        showInExport: element.showInExport,
                        resizable: element.resizable,
                        contentEditable: element.contentEditable,
                        styleEditable: element.styleEditable,

                        // Filter properties
                        blurEnabled: element.blurEnabled,
                        blurRadius: element.blurRadius,
                        brightnessEnabled: element.brightnessEnabled,
                        brightness: element.brightness,
                        sepiaEnabled: element.sepiaEnabled,
                        grayscaleEnabled: element.grayscaleEnabled,

                        // Shadow properties
                        shadowEnabled: element.shadowEnabled,
                        shadowBlur: element.shadowBlur,
                        shadowOffsetX: element.shadowOffsetX,
                        shadowOffsetY: element.shadowOffsetY,
                        shadowColor: element.shadowColor,
                        shadowOpacity: element.shadowOpacity,

                        // Additional image properties
                        cornerRadius: element.cornerRadius,
                        scaleX: element.flipX ? -1 : 1,
                        scaleY: element.flipY ? -1 : 1,
                        stroke: element.borderColor,
                        strokeWidth: element.borderSize,
                    });
                    layer.add(imageNode);
                } catch (error: any) {
                    console.error(`Error loading image:`, error.message);
                    // Optionally, you could add a placeholder image here
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
                    const image = await loadImage(svgData);

                    const canvas = createCanvas(image.width, image.height);
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0, image.width, image.height);

                    const svgNode = new Konva.Image({
                        id: element.id,
                        name: element.name,
                        x: element.x,
                        y: element.y,
                        image: (await loadImageCanvas(canvas.encodeSync("png"))) as unknown as HTMLImageElement,
                        width: element.width,
                        height: element.height,
                        rotation: element.rotation,
                        opacity: element.opacity,
                        visible: element.visible,
                        draggable: element.draggable,
                        selectable: element.selectable,
                        removable: element.removable,
                        alwaysOnTop: element.alwaysOnTop,
                        showInExport: element.showInExport,
                        resizable: element.resizable,
                        contentEditable: element.contentEditable,
                        styleEditable: element.styleEditable,

                        // Shadow properties
                        shadowEnabled: element.shadowEnabled,
                        shadowBlur: element.shadowBlur,
                        shadowOffsetX: element.shadowOffsetX,
                        shadowOffsetY: element.shadowOffsetY,
                        shadowColor: element.shadowColor,
                        shadowOpacity: element.shadowOpacity,

                        // Filter properties
                        blurEnabled: element.blurEnabled,
                        blurRadius: element.blurRadius,
                        brightnessEnabled: element.brightnessEnabled,
                        brightness: element.brightness,
                        sepiaEnabled: element.sepiaEnabled,
                        grayscaleEnabled: element.grayscaleEnabled,
                    });
                    layer.add(svgNode);
                } catch (err: any) {
                    console.error(`Failed to load SVG: ${err}`);
                }
                break;

            case "figure":
                const figure = new Konva.Rect({
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height,
                    fill: element.fill,
                    rotation: element.rotation,
                    opacity: element.opacity,
                    visible: element.visible,
                    cornerRadius: element.cornerRadius,
                });
                layer.add(figure);
                break;
        }
    }

    stage.add(layer);

    // Render the stage to the canvas
    const canvas = stage.toCanvas();
    return canvas.toDataURL();
}

export function magicResize(template: any, newWidth: number, newHeight: number) {
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
    resizedTemplate.pages.forEach((page: any) => {
        page.children.forEach((element: any) => {
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

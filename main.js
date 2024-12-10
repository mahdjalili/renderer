import fs from "fs";
import Konva from "konva";
import { loadImage } from "canvas";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";

import { replaceSvgColors } from "./utils/svg.js";
import { loadGoogleFont, magicResize } from "./utils/utils.js";

// Create a mock browser environment
const dom = new JSDOM("<!DOCTYPE html><html lang='fa' dir='rtl'><body></body></html>", {
    pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

async function renderTemplate(template, name) {
    // Create stage with template dimensions
    const stage = new Konva.Stage({
        width: template.width,
        height: template.height,
        container: document.createElement("div"), // This won't be used in Node.js
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
        switch (element.type) {
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
                        image = await loadImage(imageBuffer);
                    } else {
                        // Handle URL-based images
                        const response = await fetch(element.src);
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        image = await loadImage(buffer);
                    }

                    const imageNode = new Konva.Image({
                        id: element.id,
                        name: element.name,
                        x: element.x,
                        y: element.y,
                        image: image,
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
                } catch (error) {
                    // console.error(`Error loading image:`, error);
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

                    const svgNode = new Konva.Image({
                        id: element.id,
                        name: element.name,
                        x: element.x,
                        y: element.y,
                        image: image,
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
                } catch (err) {
                    console.error(`Failed to load SVG: ${err.message}`);
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
    const out = fs.createWriteStream(`./result/${name}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log(`Image saved as ${name}.png`));
}

const templates = JSON.parse(fs.readFileSync("./templates/templates.json", "utf8"));

for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    console.log(`${i + 1}/${templates.length}`);
    await renderTemplate(template, `template-${i + 1}`);
}

// await renderTemplate(resizedTemplate, `test`);

import fs from "fs";
import { registerFont, loadImage } from "canvas";
import Konva from "konva";
import fetch from "node-fetch";
import { replaceSvgColors } from "./svg.js";
export async function loadGoogleFont(fontFamily) {
    try {
        const fontQuery = fontFamily.replace(/\s+/g, "+");
        const response = await fetch(`https://fonts.googleapis.com/css2?family=${fontQuery}`);
        const css = await response.text();
        const fontUrlMatch = css.match(/src: url\((.+?)\)/);
        if (!fontUrlMatch)
            throw new Error("Font source not found");
        const fontUrl = fontUrlMatch[1];
        const fontResponse = await fetch(fontUrl);
        const fontBuffer = await fontResponse.arrayBuffer();
        const fontPath = `/tmp/${fontFamily.replace(/\s+/g, "_")}.ttf`;
        fs.writeFileSync(fontPath, Buffer.from(fontBuffer));
        registerFont(fontPath, { family: fontFamily });
        return true;
    }
    catch (error) {
        console.error(`Error loading font ${fontFamily}:`, error);
        return false;
    }
}
export async function renderTemplate(template, name) {
    const stage = new Konva.Stage({
        width: template.width,
        height: template.height,
        container: document.createElement("div"),
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
        switch (element.type) {
            case "text":
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
                    shadowEnabled: element.shadowEnabled,
                    shadowBlur: element.shadowBlur,
                    shadowOffsetX: element.shadowOffsetX,
                    shadowOffsetY: element.shadowOffsetY,
                    shadowColor: element.shadowColor,
                    shadowOpacity: element.shadowOpacity,
                    blurEnabled: element.blurEnabled,
                    blurRadius: element.blurRadius,
                    brightnessEnabled: element.brightnessEnabled,
                    brightness: element.brightness,
                    sepiaEnabled: element.sepiaEnabled,
                    grayscaleEnabled: element.grayscaleEnabled,
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
                        const base64Data = element.src.split(",")[1];
                        const imageBuffer = Buffer.from(base64Data, "base64");
                        image = await loadImage(imageBuffer);
                    }
                    else {
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
                        blurEnabled: element.blurEnabled,
                        blurRadius: element.blurRadius,
                        brightnessEnabled: element.brightnessEnabled,
                        brightness: element.brightness,
                        sepiaEnabled: element.sepiaEnabled,
                        grayscaleEnabled: element.grayscaleEnabled,
                        shadowEnabled: element.shadowEnabled,
                        shadowBlur: element.shadowBlur,
                        shadowOffsetX: element.shadowOffsetX,
                        shadowOffsetY: element.shadowOffsetY,
                        shadowColor: element.shadowColor,
                        shadowOpacity: element.shadowOpacity,
                        cornerRadius: element.cornerRadius,
                        scaleX: element.flipX ? -1 : 1,
                        scaleY: element.flipY ? -1 : 1,
                        stroke: element.borderColor,
                        strokeWidth: element.borderSize,
                    });
                    layer.add(imageNode);
                }
                catch (error) {
                    console.error(`Error loading image:`, error.message);
                }
                break;
            case "svg":
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
                        shadowEnabled: element.shadowEnabled,
                        shadowBlur: element.shadowBlur,
                        shadowOffsetX: element.shadowOffsetX,
                        shadowOffsetY: element.shadowOffsetY,
                        shadowColor: element.shadowColor,
                        shadowOpacity: element.shadowOpacity,
                        blurEnabled: element.blurEnabled,
                        blurRadius: element.blurRadius,
                        brightnessEnabled: element.brightnessEnabled,
                        brightness: element.brightness,
                        sepiaEnabled: element.sepiaEnabled,
                        grayscaleEnabled: element.grayscaleEnabled,
                    });
                    layer.add(svgNode);
                }
                catch (err) {
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
    const canvas = stage.toCanvas();
    const out = fs.createWriteStream(`./result/${name}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log(`Image saved as ${name}.png`));
}
export function magicResize(template, newWidth, newHeight) {
    const originalWidth = template.width;
    const originalHeight = template.height;
    const scaleX = newWidth / originalWidth;
    const scaleY = newHeight / originalHeight;
    const resizedTemplate = JSON.parse(JSON.stringify(template));
    resizedTemplate.width = newWidth;
    resizedTemplate.height = newHeight;
    resizedTemplate.pages.forEach((page) => {
        page.children.forEach((element) => {
            if (element.type === "image" || element.type === "svg") {
                const scale = Math.min(scaleX, scaleY);
                const newElementWidth = element.width * scale;
                const newElementHeight = element.height * scale;
                element.x *= scaleX;
                element.y *= scaleY;
                element.width = newElementWidth;
                element.height = newElementHeight;
            }
            else {
                element.x *= scaleX;
                element.y *= scaleY;
                element.width *= scaleX;
                element.height *= scaleY;
            }
            if (element.type === "text") {
                element.fontSize *= scaleX;
            }
            if (element.shadowBlur)
                element.shadowBlur *= scaleX;
            if (element.shadowOffsetX)
                element.shadowOffsetX *= scaleX;
            if (element.shadowOffsetY)
                element.shadowOffsetY *= scaleY;
            if (element.borderSize)
                element.borderSize *= scaleX;
            if (element.cornerRadius)
                element.cornerRadius *= scaleX;
            if (element.blurRadius)
                element.blurRadius *= scaleX;
        });
    });
    return resizedTemplate;
}

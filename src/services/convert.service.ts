import { spawn } from "child_process";
import axios from "axios";

import { ImageTracer, Options } from "@image-tracer-ts/core";

import { readPsd } from "ag-psd";
import "ag-psd/initialize-canvas";

export const ocr = (imageType: string, imageData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const pythonFile = "src/utils/ocr/ocr.py";
        const pythonProcess = spawn("python", [pythonFile, imageType, imageData]);

        let result = "";
        let error = "";

        pythonProcess.stdout.on("data", (data: Buffer) => {
            result += data.toString();
        });

        pythonProcess.stderr.on("data", (data: Buffer) => {
            error += data.toString();
        });

        pythonProcess.on("close", (code: number) => {
            if (code === 0) {
                resolve(result.trim());
            } else {
                reject(error.trim());
            }
        });
    });
};

export const imageToText = async (imageInput: any) => {
    let imageType;
    let imageData;

    if (imageInput.startsWith("http")) {
        imageType = "url";
        imageData = imageInput;
    } else if (imageInput.startsWith("data:image/")) {
        imageType = "base64";
        imageData = imageInput.split(",")[1]; // Extract Base64 content
    } else {
        throw new Error("Invalid image input. Provide a URL or Base64 image.");
    }

    try {
        const result = await ocr(imageType, imageData);
        return JSON.parse(result.replace(/'/g, '"'));
    } catch (error) {
        throw error;
    }
};

export const openPsd = (psdData: ArrayBuffer) => {
    const psdFile = readPsd(psdData);
    return psdFile;
};

export const svgToBase64 = (svgString: string) => {
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
};

export const canvasToSvg = (canvas: any) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const options: Partial<Options> = {
        blurRadius: 3,
        blurDelta: 40,
    };
    const tracer = new ImageTracer(options);

    // Convert to SVG using ImageTracer library
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const svg = tracer.traceImageToSvg(imageData);
    return svgToBase64(svg);
};

export const convertPSDToTemplate = (psdData: ArrayBuffer): any => {
    const psd = openPsd(psdData);
    // console.log(psd.children);
    return {
        width: psd.width,
        height: psd.height,
        pages: [
            {
                id: 1,
                children: psd.children?.map((child: any) => {
                    const src = child.mask ? child.canvas.toDataURL() : canvasToSvg(child.canvas);
                    const type = child.mask ? "image" : "svg";

                    return {
                        type, //child.type
                        id: child.id.toString(),
                        name: child.name,
                        visible: child.visible,
                        opacity: child.opacity,
                        blendingMode: child.blendingMode,
                        x: child.left,
                        y: child.top,
                        width: child.canvas.width,
                        height: child.canvas.height,
                        mask: child.mask?.canvas?.toDataURL(),
                        src,
                    };
                }),
            },
        ],
    };
};

export const psdUrlToTemplate = async (psdUrl: string) => {
    const response = await axios.get(psdUrl, { responseType: "arraybuffer" });
    const psdFile = response.data;
    return convertPSDToTemplate(psdFile);
};

type Replacements = Record<string, string | number | boolean>;
export function replaceTemplateVariables(template: any, replacements: Replacements): any {
    // Recursive function to traverse and replace variables
    function traverseAndReplace(obj: any): any {
        if (Array.isArray(obj)) {
            // If it's an array, process each element
            return obj.map(traverseAndReplace);
        } else if (typeof obj === "object" && obj !== null) {
            // If it's an object, replace variables in its keys/values
            const newObj: any = { ...obj };
            for (const key in newObj) {
                if (typeof newObj[key] === "string") {
                    // Replace placeholders in string values
                    newObj[key] = replacePlaceholders(newObj[key], replacements);
                } else {
                    // Recursively process nested objects/arrays
                    newObj[key] = traverseAndReplace(newObj[key]);
                }
            }
            return newObj;
        } else {
            // For other types, return as is
            return obj;
        }
    }

    // Replace placeholders in a string or keep the type intact
    function replacePlaceholders(str: string, replacements: Replacements): string | number | boolean {
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            if (key in replacements) {
                const value = replacements[key];
                // Keep the original type intact for the replacement
                return typeof value === "number" || typeof value === "boolean" ? value : String(value);
            }
            return match;
        });
    }

    // Start traversal and replacement from the template
    return traverseAndReplace(template);
}

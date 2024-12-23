import "ag-psd/initialize-canvas";
import { readPsd } from "ag-psd";
import { createCanvas } from "canvas";
import { ocr } from "../services/ocr.service";

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

export const convertPSDToTemplate = (psdData: ArrayBuffer): any => {
    const psd = openPsd(psdData);

    console.log(psd.children);

    const applyMask = (layer: any, mask: any) => {
        const canvas = createCanvas(layer.canvas.width, layer.canvas.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.drawImage(layer.canvas, 0, 0);

        // If there is a mask, convert black & white to alpha channel
        if (mask && mask.canvas) {
            const maskCtx = mask.canvas.getContext("2d");
            if (!maskCtx) return null;

            // Read the mask’s pixel data
            const { width: maskWidth, height: maskHeight } = mask.canvas;
            const maskData = maskCtx.getImageData(0, 0, maskWidth, maskHeight);
            const data = maskData.data;

            // Convert black/white brightness to alpha
            // Example: fully black => alpha=0, fully white => alpha=255
            //          or grayscale => alpha matches brightness
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Simple average to determine brightness
                const brightness = (r + g + b) / 3;
                // Use brightness directly as alpha channel
                data[i + 3] = brightness;
            }

            // Put the adjusted data back
            maskCtx.putImageData(maskData, 0, 0);

            // 3. Now apply the mask via 'destination-in'
            ctx.globalCompositeOperation = "destination-in";

            // Position the mask properly relative to the layer
            const offsetX = mask.left - layer.left;
            const offsetY = mask.top - layer.top;
            ctx.drawImage(mask.canvas, offsetX, offsetY);
        }

        return canvas;
    };
    return {
        width: psd.width,
        height: psd.height,
        pages: [
            {
                id: 1,
                children: psd.children?.map((child: any) => {
                    const src = child.mask ? applyMask(child, child.mask)?.toDataURL() : child.canvas?.toDataURL();

                    return {
                        type: "image", //child.type
                        id: child.id.toString(),
                        name: child.name,
                        visible: child.visible,
                        opacity: child.opacity,
                        blendingMode: child.blendingMode,
                        x: child.left,
                        y: child.top,
                        width: child.canvas.width,
                        height: child.canvas.height,
                        src,
                    };
                }),
            },
        ],
    };
};

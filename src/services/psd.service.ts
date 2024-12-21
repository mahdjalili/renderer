import "ag-psd/initialize-canvas";
import { readPsd } from "ag-psd";
import { ocr } from "../utils/ocr/ocr";

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
    return psd.children?.map((page) => {
        return {
            width: psd.width,
            height: psd.height,
            pages: [
                {
                    id: 1,
                    children: page.children?.map((child: any) => {
                        return {
                            type: "image", //child.type
                            id: child.id.toString(),
                            name: child.name,
                            visible: child.visible,
                            opacity: child.opacity,
                            blendingMode: child.blendingMode,
                            x: child.left,
                            y: child.top,
                            width: child.width,
                            height: child.height,
                            src: child.canvas?.toDataURL(),
                        };
                    }),
                },
            ],
        };
    });
};

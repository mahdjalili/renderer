import "ag-psd/initialize-canvas"; // only needed for reading image data and thumbnails
import { readPsd } from "ag-psd";

export const openPsd = (psdData: ArrayBuffer) => {
    const psdFile = readPsd(psdData);
    return psdFile;
};

export const convertPSDToTemplate = (psdData: ArrayBuffer) => {
    const psd = openPsd(psdData);
    console.log(psd.children[0].children);
    return {
        width: psd.width,
        height: psd.height,
        pages: psd.children.map((page: any) => {
            return {
                id: page.id,
                children: page.children.map((child: any) => {
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
                        src: child.canvas.toDataURL(),
                    };
                }),
            };
        }),
    };
};

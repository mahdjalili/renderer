import Psd from "@webtoon/psd";
export function traverseNode(node) {
    if (node.type === "Layer") {
        console.log("Layer", node);
    }
    else if (node.type === "Group") {
        console.log("Group", node);
    }
    else if (node.type === "Psd") {
        console.log("Psd", node);
    }
    else {
        throw new Error("Invalid node type");
    }
    node.children?.forEach((child) => traverseNode(child));
}
export const openPsd = (psdData) => {
    const psdFile = Psd.parse(psdData);
    return psdFile;
};

export const loadSVG = async (svgData) => {
    const svg = new DOMParser().parseFromString(svgData, "image/svg+xml");
    return svg;
};
export function replaceSvgColors(svgString, colorsReplace) {
    let modifiedSvgString = svgString;
    if (colorsReplace) {
        Object.entries(colorsReplace).forEach(([fromColor, toColor]) => {
            const colorRegex = new RegExp(fromColor.replace(/[()]/g, "\\$&").replace(/\s+/g, "\\s*"), "g");
            modifiedSvgString = modifiedSvgString.replace(colorRegex, toColor);
        });
    }
    return modifiedSvgString;
}

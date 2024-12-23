export const magicResize = (template: any, newWidth: number, newHeight: number): any => {
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
};

type Template = Record<string, any>;
type Replacements = Record<string, string | number | boolean>;

export function replaceTemplateVariables(template: Template, replacements: Replacements): Template {
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

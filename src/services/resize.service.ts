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

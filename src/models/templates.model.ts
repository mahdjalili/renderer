export const templatesFile = Bun.file("./public/templates.json", {
    type: "application/json",
});

export const getTemplates = async () => {
    return await templatesFile.json();
};

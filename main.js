import fs from "fs";
import { JSDOM } from "jsdom";

// Create a mock browser environment
const dom = new JSDOM("<!DOCTYPE html><html lang='fa' dir='rtl'><body></body></html>", {
    pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

import { renderTemplate, magicResize } from "./utils/utils.js";

const templates = JSON.parse(fs.readFileSync("./templates/templates.json", "utf8"));
const template = JSON.parse(fs.readFileSync("./templates/template.json", "utf8"));
await renderTemplate(template, "template");

// for (let i = 0; i < templates.length; i++) {
//     const template = templates[i];
//     console.time(`${i + 1}/${templates.length}`);
//     const resizedTemplate = await magicResize(template, 1080, 1920);
//     await renderTemplate(resizedTemplate, `template-${i + 1}`);
//     console.timeEnd(`${i + 1}/${templates.length}`);
// }

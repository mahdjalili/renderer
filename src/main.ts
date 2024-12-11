import fs from "fs";
import { JSDOM } from "jsdom";

declare global {
    var window: Window & typeof globalThis;
    var document: Document;
    var navigator: Navigator;
}

const dom = new JSDOM("<!DOCTYPE html><html lang='fa' dir='rtl'><body></body></html>", {
    pretendToBeVisual: true,
});
global.window = dom.window as unknown as (Window & typeof globalThis);
global.document = dom.window.document;
global.navigator = dom.window.navigator;

import { renderTemplate, magicResize } from "./utils/utils.js";

interface Template {
    [key: string]: any;
}

// Read and parse JSON files with type assertions
const templates: Template[] = JSON.parse(fs.readFileSync("./src/templates/templates.json", "utf8"));
const template: Template = JSON.parse(fs.readFileSync("./src/templates/template.json", "utf8"));

await renderTemplate(template, "template");

// for (var i = 0; i < 10; i++) {
//     await renderTemplate(templates[i], `template-${i}`);
// }

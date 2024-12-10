import fs from "fs";
import { JSDOM } from "jsdom";

// Create a mock browser environment
const dom = new JSDOM("<!DOCTYPE html><html lang='fa' dir='rtl'><body></body></html>", {
    pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

import { renderTemplate, makeTemplate } from "./utils/utils.js";

const templates = JSON.parse(fs.readFileSync("./templates/templates.json", "utf8"));

for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    console.time(`${i + 1}/${templates.length}`);
    await renderTemplate(template, `template-${i + 1}`);
    console.timeEnd(`${i + 1}/${templates.length}`);
}

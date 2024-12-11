import fs from "fs";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!DOCTYPE html><html lang='fa' dir='rtl'><body></body></html>", {
    pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
import { renderTemplate } from "./utils/utils.js";
const templates = JSON.parse(fs.readFileSync("./src/templates/templates.json", "utf8"));
const template = JSON.parse(fs.readFileSync("./src/templates/template.json", "utf8"));
await renderTemplate(template, "template");

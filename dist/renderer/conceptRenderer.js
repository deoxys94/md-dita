"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConceptRenderer = void 0;
const defaultRenderer_1 = require("./defaultRenderer");
class ConceptRenderer extends defaultRenderer_1.BaseDitaRenderer {
    constructor() {
        super();
        this.md.renderer.rules.heading_open = (tokens, idx) => tokens[idx].tag === 'h1' ? `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "concept.dtd"[]>\n<concept>\n<title>` : `<section><title>`;
        this.md.renderer.rules.heading_close = (tokens, idx) => tokens[idx].tag === 'h1' ? `</title>\n<conbody>\n` : `</title></section>\n`;
    }
    toDitaConcept(markdown) {
        markdown = this.md.render(markdown);
        if (!/<\?xml version="1.0" encoding="utf-8"\?>/.test(markdown))
            throw "NoHeaders";
        return markdown;
    }
}
exports.ConceptRenderer = ConceptRenderer;

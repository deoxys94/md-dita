"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceRenderer = void 0;
const defaultRenderer_1 = require("./defaultRenderer");
class ReferenceRenderer extends defaultRenderer_1.BaseDitaRenderer {
    constructor() {
        super();
        this.md.renderer.rules.heading_open = (tokens, idx) => tokens[idx].tag === 'h1' ? `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE reference PUBLIC "-//OASIS//DTD DITA Reference//EN" "reference.dtd"[]>\n<reference id=[tbd]>\n<title>` : `<section>\n<title>`;
        this.md.renderer.rules.heading_close = (tokens, idx) => tokens[idx].tag === 'h1' ? `</title>\n<refbody>\n` : `</title>\n</section>\n`;
    }
    toDitaReference(markdown) {
        markdown = this.md.render(markdown);
        if (!/<\?xml version="1.0" encoding="utf-8"\?>/.test(markdown))
            throw "NoHeaders";
        return markdown;
    }
}
exports.ReferenceRenderer = ReferenceRenderer;

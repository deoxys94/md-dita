import { BaseDitaRenderer } from "./defaultRenderer";

export class TaskRenderer extends BaseDitaRenderer{
    constructor() {
        super();

        this.md.renderer.rules.heading_open = (tokens, idx) => tokens[idx].tag === 'h1' ? `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE task PUBLIC "-//OASIS//DTD DITA Task//EN" "task.dtd">\n<task id="<tbd>">\n<title>` : `<title>`;

        this.md.renderer.rules.heading_close = (tokens, idx) => tokens[idx].tag === 'h1' ? `</title>\n<taskbody>\n` : `</title>\n`;

        this.md.renderer.rules.list_item_open = (tokens, idx) => tokens[idx].markup === '.' ? '<step>' : this.md.renderer.renderToken(tokens, idx);

        this.md.renderer.rules.list_item_close = (tokens, idx) => tokens[idx].markup === '.' ? '</step>' : this.md.renderer.renderToken(tokens, idx);

        this.md.renderer.rules.ordered_list_open = (tokens, idx) => tokens[idx].level === 0 ? '<steps>\n' : this.md.renderer.renderToken(tokens, idx);

        this.md.renderer.rules.ordered_list_close = (tokens, idx) => tokens[idx].level === 0 ? '\n</steps>\n' : this.md.renderer.renderToken(tokens, idx);
    }

    toDitaTask(markdown: string): string {
        markdown = this.md.render(markdown);

        if (!/<\?xml version="1.0" encoding="utf-8"\?>/.test(markdown))
            throw "NoHeaders";

        return `${markdown}</taskbody>\n</task>`;
    }
}
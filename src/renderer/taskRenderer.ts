import { BaseDitaRenderer } from "./defaultRenderer";

export class TaskRenderer extends BaseDitaRenderer
{
    constructor()
    {
        super();

        this.md.renderer.rules.heading_open = (tokens, idx) => tokens[idx].tag === 'h1' ? `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE task PUBLIC "-//OASIS//DTD DITA Task//EN" "task.dtd">\n<task id="topic-id-placeholder" xml:lang="en-us">\n<title>` : `<title>`;

        this.md.renderer.rules.heading_close = (tokens, idx) => tokens[idx].tag === 'h1' ? `</title>\n<taskbody>\n` : `</title>\n`;

        this.md.renderer.rules.list_item_open = (tokens, idx) => (tokens[idx].markup === '.' && tokens[idx].level === 1) ? '<step>' : this.md.renderer.renderToken(tokens, idx, {});

        this.md.renderer.rules.list_item_close = (tokens, idx) => (tokens[idx].markup === '.' && tokens[idx].level === 1) ? '</step>\n' : this.md.renderer.renderToken(tokens, idx, {});

        this.md.renderer.rules.ordered_list_open = (tokens, idx) => tokens[idx].level === 0 ? '<steps>\n' : this.md.renderer.renderToken(tokens, idx, {});

        this.md.renderer.rules.ordered_list_close = (tokens, idx) => tokens[idx].level === 0 ? '\n</steps>\n' : this.md.renderer.renderToken(tokens, idx, {});
    }

    toDitaTask(markdown: string, eventLogger: any): string
    {
        try
        {
            markdown = this.md.render(markdown);

            if (!markdown.includes(`<?xml version="1.0" encoding="utf-8"?>`))
                throw "NoHeaders";

            return `${markdown}</taskbody>\n</task>`;
        } catch (error)
        {
            eventLogger.logError(`Unable to convert document to DITA XML. Verify your file is properly formatted and try again. (Error code: 203)\n${error}`);
            return ``;
        }
    }
}

import { BaseDitaRenderer } from "./defaultRenderer";

export class ConceptRenderer extends BaseDitaRenderer
{
    constructor()
    {
        super();

        this.md.renderer.rules.heading_open = (tokens, idx) => tokens[idx].tag === 'h1' ? `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "concept.dtd">\n<concept id="<tbd>">\n<title>` : `<section><title>`;

        this.md.renderer.rules.heading_close = (tokens, idx) => tokens[idx].tag === 'h1' ? `</title>\n<conbody>\n` : `</title></section>\n`;

    }

    toDitaConcept(markdown: string): string
    {
        try
        {
            markdown = this.md.render(markdown);

            if (!/<\?xml version="1.0" encoding="utf-8"\?>/.test(markdown))
                throw "NoHeaders";

            return `${markdown}\n</conbody>\n</concept>`;
        } catch (error)
        {
            console.error(error);
        }
    }
}
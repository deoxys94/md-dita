import * as cheerio from 'cheerio';
import { simpleLogger } from "../md-dita";
import { FlavorType } from "../types";

export const convertNotes = (xml: string, eventLogger: simpleLogger, flavor: FlavorType): string =>
{
    // {: .note} / {: .tip} / {: .warning} inline attribute syntax is MkDocs-specific
    const simpleNotePattern = /\{:?\s?.(note|tip|warning)\s?\}/;
    try
    {
        const $ = cheerio.load(xml, { xml: { decodeEntities: false } });

        if (flavor === FlavorType.GFM)
        {
            $('lq').each((_, element) =>
            {
                const $lq = $(element);
                const $firstP = $lq.find('p').first();
                const firstPHtml = $firstP.html() || '';
                const match = firstPHtml.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n?([\s\S]*)/i);

                if (match)
                {
                    const type = match[1].toLowerCase();
                    const remaining = match[2].trim();

                    if (remaining)
                    {
                        $firstP.html(remaining);
                    }
                    else
                    {
                        $firstP.remove();
                    }

                    const $note = $('<note></note>').html($lq.html()!);
                    if (type !== 'note') $note.attr('type', type);
                    $lq.replaceWith($note);
                }
            });
        }

        $('p, aside').each((_, element) =>
        {
            const $element = $(element);
            const html = $element.html();

            if (element.tagName === 'p' && html && flavor === FlavorType.MkDocs && simpleNotePattern.test(html))
            {
                const noteType = html.includes('.note') ? '' : html.includes('.tip') ? 'tip' : 'warning';
                const cleanedContent = `<p>${html.replace(simpleNotePattern, '')}</p>`;
                const noteHtml = $('<note></note>').html(cleanedContent);

                if (noteType) noteHtml.attr('type', noteType);

                $element.replaceWith(noteHtml);
            } else if (element.tagName === 'aside')
            {
                // <aside type="..."> → <note type="..."> for all flavors
                $element.find('br').replaceWith('<p/>');

                const typeAttr = $element.attr('type');
                const noteHtml = $('<note></note>').html(html!);

                if (typeAttr !== 'note') noteHtml.attr('type', typeAttr);

                $element.replaceWith(noteHtml);
            }
        });

        eventLogger.logInfo('Converted notes to DITA XML notes.');
        return $.html();
    } catch (error)
    {
        eventLogger.logWarning(`Unable to convert notes to DITA. Verify the resulting DITA file afterwards. (Error Code: 105)\n${error}`);
        return xml;
    }
};
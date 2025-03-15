import * as cheerio from 'cheerio';

export const convertNotes = (xml: string, eventLogger: any): string =>
{
    const simpleNotePattern = /\{:?\s?.(note|tip|warning)\s?\}/;
    try
    {
        const $ = cheerio.load(xml, { xml: { decodeEntities: false } });

        $('p, aside').each((_, element) =>
        {
            const $element = $(element);
            const html = $element.html();

            if (element.tagName === 'p' && html && simpleNotePattern.test(html))
            {
                const noteType = html.includes('.note') ? '' : html.includes('.tip') ? 'tip' : 'warning';
                const cleanedContent = `<p>${html.replace(simpleNotePattern, '')}</p>`;
                const noteHtml = $('<note></note>').html(cleanedContent);

                if (noteType) noteHtml.attr('type', noteType);

                $element.replaceWith(noteHtml);
            } else if (element.tagName === 'aside')
            {
                $element.find('br').replaceWith('<p/>');

                const typeAttr = $element.attr('type');
                const noteHtml = $('<note></note>').html(html);

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
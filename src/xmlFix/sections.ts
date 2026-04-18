import * as cheerio from 'cheerio';
import { isTag } from 'domhandler';
import { simpleLogger } from "../md-dita";
import { TopicType } from "../types";

/**
 * Fixes sections in a DITA XML string using Cheerio DOM manipulation.
 *
 * Due to Markdown-it limitations, content between section headings is rendered
 * as orphaned sibling nodes outside the `<section>` elements rather than inside
 * them. This function moves those orphaned nodes into their preceding `<section>`.
 *
 * For reference topics with no sections, all body content is wrapped in a single
 * `<section>` element. For reference topics where content precedes the first
 * `<section>`, that content is also wrapped in its own `<section>`.
 *
 * Example of raw renderer output:
 * ```
 *  <refbody>
 *      <section>
 *        <title>Foo bar 1</title>
 *      </section>
 *       Lorem ipsum dolor sit amet...
 *      <section>
 *        <title>Foo bar 2</title>
 *      </section>
 *      Lorem ipsum dolor sit amet...
 * </refbody>
 * ```
 *
 * After this function:
 * ```
 *  <refbody>
 *      <section>
 *        <title>Foo bar 1</title>
 *        Lorem ipsum dolor sit amet...
 *      </section>
 *      <section>
 *        <title>Foo bar 2</title>
 *        Lorem ipsum dolor sit amet...
 *      </section>
 * </refbody>
 * ```
 */
export const fixSections = (xml: string, type: TopicType, eventLogger: simpleLogger): string =>
{
    try
    {
        const $ = cheerio.load(xml, { xml: { decodeEntities: false } });
        const bodyTag = type === TopicType.Concept ? 'conbody' : 'refbody';
        const body = $(bodyTag);

        if (body.length === 0)
        {
            eventLogger.logInfo(`No topic body found.`);
            return xml;
        }

        const sections = body.children('section');

        if (sections.length === 0)
        {
            eventLogger.logInfo(`No sections detected.`);
            if (type === TopicType.Reference)
            {
                // Wrap all refbody content in a single section
                body.wrapInner('<section></section>');
            }
            return $.html();
        }

        // Move orphaned sibling nodes (content sitting between <section> elements)
        // into the preceding <section> element
        sections.each((_, sectionEl) =>
        {
            const $section = $(sectionEl);
            const orphans = $section.nextUntil('section');
            orphans.each((_, node) => { $section.append(node); });
        });

        // For reference topics: if any element content appears before the first
        // <section>, wrap it in an anonymous <section> to keep the structure valid
        if (type === TopicType.Reference)
        {
            const firstSection = body.children('section').first();
            const beforeFirst = firstSection.prevAll();
            const hasElementBefore = beforeFirst.toArray().some(n => isTag(n));

            if (hasElementBefore)
            {
                const wrapper = $('<section></section>');
                firstSection.before(wrapper);
                // prevAll() returns nearest-first — reverse to preserve document order
                beforeFirst.toArray().reverse().forEach(node => wrapper.append($(node)));
            }
        }

        eventLogger.logInfo(`Sections generated.`);
        return $.html();
    } catch (error)
    {
        eventLogger.logError(`Unable to generate sections. ${error}`);
        return ``;
    }
};

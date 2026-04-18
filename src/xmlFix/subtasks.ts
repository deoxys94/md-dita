import * as cheerio from 'cheerio';
import { simpleLogger } from "../md-dita";

/**
 * Splits a DITA task XML string into a main task and nested subtasks using
 * Cheerio DOM manipulation.
 *
 * When multiple H2 headings are present in a task Markdown file, Markdown-it
 * renders them as bare `<title>` elements directly inside `<taskbody>`, with
 * their content (steps, info, etc.) following as orphaned siblings. This
 * function identifies those `<title>` markers, collects their following sibling
 * content up to the next `<title>`, and wraps each group in a proper nested
 * `<task>` element appended after the main `</taskbody>`.
 */
export const fixSubtasks = (xml: string, eventLogger: simpleLogger): string =>
{
    try
    {
        eventLogger.logInfo(`Fixing subtasks`);

        const $ = cheerio.load(xml, { xml: { decodeEntities: false } });
        const taskbody = $('taskbody');

        if (taskbody.length === 0)
        {
            eventLogger.logInfo(`No task body found.`);
            return xml;
        }

        const titles = taskbody.children('title');

        if (titles.length === 0)
        {
            eventLogger.logInfo(`No subtasks detected.`);
            return xml;
        }

        // Pass 1 (read-only): collect subtask data and the nodes to remove,
        // before any DOM mutations that could affect sibling traversal
        const subtaskData: Array<{ titleHtml: string; bodyHtml: string }> = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nodesToRemove: any[] = [];

        titles.each((_, titleEl) =>
        {
            const $title = $(titleEl);
            const orphans = $title.nextUntil('title');

            subtaskData.push({
                titleHtml: $.html(titleEl),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                bodyHtml: orphans.map((_, n) => $.html(n as any)).get().join(''),
            });

            nodesToRemove.push(titleEl);
            orphans.each((_, node) => { nodesToRemove.push(node); });
        });

        // Pass 2 (write): remove subtask nodes from taskbody
        $(nodesToRemove).remove();

        // Build nested <task> XML and insert after the main </taskbody>
        let subtaskXml = '';
        subtaskData.forEach(({ titleHtml, bodyHtml }, index) =>
        {
            subtaskXml += `\n<task id="sub_task_${index + 1}">\n${titleHtml}\n<taskbody>\n${bodyHtml}\n</taskbody>\n</task>`;
        });

        taskbody.after(subtaskXml);

        return $.html();
    } catch (error)
    {
        eventLogger.logError(`Unable to fix subtasks. (Error code: 204)\n${error}`);
        return ``;
    }
};

import { simpleLogger } from "../md-dita";

/**
 * Converts Docusaurus-style admonitions (:::note ... :::) to <aside> elements
 * that the standard notes post-processor can then convert to DITA <note> elements.
 *
 * Supported types: note, tip, warning, danger, caution
 */
export const fixDocusaurusAdmonitions = (markdown: string, eventLogger: simpleLogger): string =>
{
    eventLogger.logInfo('Converting Docusaurus admonitions to <aside> elements');

    return markdown.replace(
        /:::(note|tip|warning|danger|caution)\s*\n([\s\S]*?)\n:::/g,
        (_, type, content) => `<aside type="${type}">${content.trim()}</aside>`
    );
};

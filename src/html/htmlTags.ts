import * as cheerio from "cheerio";
import { simpleLogger } from "../md-dita";

/**
 * Deletes unnecessary HTML tags and transforms certain raw HTML elements to
 * equivalent DITA XML elements.
 *
 * @param markdown - The markdown string to be transformed.
 * @param eventLogger - The logger to log events.
 * @returns The transformed DITA XML string or an empty string if transformation
 * fails.
 */
export const transformRawHtml = (markdown: string, eventLogger: simpleLogger) => {
  try {
    eventLogger.logInfo(`Transforming raw HTML tags to DITA equivalents`);

    // Load the XML string into Cheerio
    const $ = cheerio.load(markdown, {
      xml: true,
    });

    // Transform elements with class="code" to <codeblock>
    $("span.code, div.code, p.code, i.code, pre.code, li.code").each(
      (_, el) => {
        const content = $(el).html();
        $(el).replaceWith(`<codeblock>${content}</codeblock>`);
      },
    );

    // Transform elements with class="note" to <note>
    $("span.note, div.note, p.note, i.note, pre.note, li.note").each(
      (_, el) => {
        const content = $(el).html();
        $(el).replaceWith(`<note>${content}</note>`);
      },
    );

    // Transform elements with class="tip" to <note type="tip">
    $("span.tip, div.tip, p.tip, i.tip, pre.tip, li.tip").each((_, el) => {
      const content = $(el).html();
      $(el).replaceWith(`<note type="tip">${content}</note>`);
    });

    // Transform elements with class="ui" to <checkMenu>
    $("span.ui, div.ui, p.ui, i.ui, pre.ui, li.ui").each((_, el) => {
      const content = $(el).html();
      $(el).replaceWith(`<checkMenu>${content}</checkMenu>`);
    });

    // Transform links with href to <xref>
    $("[href]").each((_, el) => {
      const href = $(el).attr("href");
      const content = $(el).html();
      $(el).replaceWith(`<xref href="${href}">${content}</xref>`);
    });

    // Transform anchors with name to paragraphs with id
    $("a[name]").each((_, el) => {
      const name = $(el).attr("name");
      $(el).replaceWith(`<p id="${name}"></p>`);
    });

    // Replace strong tags with a temporary tag <checkMenu>
    // Sometimes, full menu paths are wrapped in a single <strong> tag (for example **foo > bar**).
    // This can be problematic because DITA has its own menucascade elements.
    // We first place a temporary tag that helps us identify the possible menu paths.
    $("strong").each((_, el) => {
      const content = $(el).html();
      $(el).replaceWith(`<checkMenu>${content}<checkMenu>`);
    });

    // Replace em tags with cite tags
    $("em").each((_, el) => {
      const content = $(el).html();
      $(el).replaceWith(`<cite>${content}</cite>`);
    });

    // Replace code tags with codeblock tags
    $("code").each((_, el) => {
      const content = $(el).html();
      $(el).replaceWith(`<codeph>${content}</codeph>`);
    });

    // Transform <pre> to codeblocks
    $("pre").each((_, el) => {
      const content = $(el).html();
      $(el).replaceWith(`<codeblock>${content}</codeblock>`);
    });

    // Remove pre, br, hr tags
    $("hr").remove();

    // Remove style attributes
    $("[style]").each((_, el) => {
      $(el).removeAttr("style");
    });

    // Return the transformed XML
    return $.html();
  } catch (error) {
    eventLogger.logWarning(
      `Unable to delete unnecessary HTML tags. Verify the resulting DITA file afterwards. (Error Code: 104)\n${error}`,
    );
    return markdown;
  }
};

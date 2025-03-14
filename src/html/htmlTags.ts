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
export const transformRawHtml = (markdown: string, eventLogger: simpleLogger) =>
{
  try
  {
    eventLogger.logInfo(`Transforming raw HTML tags to DITA equivalents`);

    const $ = cheerio.load(markdown, {
      xml: { decodeEntities: false }
    });

    // Define transformations as an array of objects
    const transformations = [
      { selector: ".code", replacement: (content: string) => `<codeblock>${content}</codeblock>` },
      { selector: ".note", replacement: (content: string) => `<aside type="note">${content}</aside>` },
      { selector: ".tip", replacement: (content: string) => `<aside type="tip">${content}</aside>` },
      { selector: ".warning", replacement: (content: string) => `<aside type="warning">${content}</aside>` },
      { selector: ".ui", replacement: (content: string) => `<strong>${content}</strong>` },
      { selector: "[href]", replacement: (content: string, el: any) => `<xref href="${$(el).attr("href")}">${content}</xref>` },
      { selector: "a[name]", replacement: (_: string, el: any) => `<xref class="anchor-only" id="${$(el).attr("name")}"></xref>` },
      { selector: "em", replacement: (content: string) => `<cite>${content}</cite>` },
      { selector: "code", replacement: (content: string) => `<codeph>${content}</codeph>` },
      { selector: "pre", replacement: (content: string) => `<codeblock>${content}</codeblock>` }
    ];

    // Apply transformations
    transformations.forEach(({ selector, replacement }) =>
    {
      $(selector).each((_, el) =>
      {
        const content = $(el).html() || '';
        $(el).replaceWith(replacement(content, el));
      });
    });

    // Remove unwanted tags and attributes
    $("hr").remove();
    $("[style]").removeAttr("style");

    return $.html();
  } catch (error)
  {
    eventLogger.logWarning(
      `Unable to delete unnecessary HTML tags. Verify the resulting DITA file afterwards. (Error Code: 104)\n${error}`
    );
    return markdown;
  }
};

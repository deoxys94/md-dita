import * as cheerio from 'cheerio';
import { simpleLogger } from "../md-dita";

/**
 * Converts menu cascade elements in an XML string by processing strong elements using Cheerio.
 * 
 * @param xml - The input XML string to be processed
 * @param eventLogger - A simple logger for recording information and errors during processing
 * @returns The modified XML string with menu paths converted
 * 
 * @remarks
 * This function performs the following operations:
 * - Uses Cheerio to parse the XML and select strong elements
 * - Processes each strong element to identify menu paths
 * - Handles menu paths containing '>' or '→' symbols
 * - Wraps menu path elements appropriately
 * 
 * @throws {Error} Catches and logs any errors during XML processing
 * 
 * @example
 * ```typescript
 * const inputXml = '<strong>File > New > Project</strong>';
 * const processedXml = fixMenuCascadeElements(inputXml, logger);
 * ```
 */
export const fixMenuCascadeElements = (xml: string, eventLogger: simpleLogger): string =>
{
  try
  {
    // Parse the XML with Cheerio
    const $ = cheerio.load(xml, {
      xml: { decodeEntities: false }
    });

    // Find all strong elements
    const strongElements = $('strong');

    // If no strong elements are found, return the original XML
    if (strongElements.length === 0)
    {
      eventLogger.logInfo(`No menu paths found.`);
      return xml;
    }

    // Process each strong element
    strongElements.each((_, element) =>
    {
      const $element = $(element);
      const text = $element.text().trim();

      // Create a replacement node
      let replacement: any;

      // Check if the text contains '>' or arrow symbols
      if (text.includes('>') || text.includes('→') || $element.html()?.includes('&gt;'))
      {
        // Split by '>', '→', or '&gt;' and create menu cascade
        let parts: string[];

        if ($element.html()?.includes('&gt;'))
        {
          parts = $element.html()?.split('&gt;') || [];
        } else if (text.includes('>'))
        {
          parts = text.split('>');
        } else
        {
          parts = text.split('→');
        }

        // Create a new menucascade element
        replacement = $('<menucascade></menucascade>');

        // Add each part as a uicontrol
        parts.forEach(part =>
        {
          // Remove any nested codeph tags if they exist
          const cleanPart = part.replace(/<\/?codeph>/g, '').trim();
          if (cleanPart)
          {
            replacement.append($(`<uicontrol>${cleanPart}</uicontrol>`));
          }
        });
      } else
      {
        // Wrap with a single uicontrol element
        const cleanText = text.replace(/<\/?codeph>/g, '').trim();
        replacement = $(`<uicontrol>${cleanText}</uicontrol>`);
      }

      // Replace the original element with the new one
      $element.replaceWith(replacement);
    });

    // Get the modified XML
    const result = $.html();

    // Log successful conversion
    eventLogger.logInfo(`Converted menu paths to <menucascade> elements.`);
    return result;

  } catch (error)
  {
    // Log error and return original XML
    eventLogger.logError(
      `Unable to convert menu paths to menu cascades. Verify the resulting file afterwards. (Error Code: 302)\n${error}`
    );
    return xml;
  }
};
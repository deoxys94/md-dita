import { simpleLogger } from "../md-dita";

/**
 * Transforms collapsible elements in markdown by converting special syntax to markdown headers
 *
 * @param markdown - The input markdown string to be processed
 * @param eventLogger - A logging object to record information and warnings during processing
 * @returns The modified markdown string with collapsible elements converted
 *
 * @remarks
 * This function does the following:
 * 1. Finds the pattern of collapsible elements ('??? "Section title"')
 * 2. Trims whitespace and indentation from all lines under the section title
 * 3. Converts collapsible elements to markdown headers (##)
 * 4. Handles special cases with bold formatting
 *
 * @example
 * ```typescript
 * const input = '??? "**Section Title**"';
 * const processed = fixCollapsibleElements(input, logger);
 * // Returns: '## Section Title'
 * ```
 */
export const fixCollapsibleElements = (markdown: string, eventLogger: simpleLogger): string =>
{
  eventLogger.logInfo(`Finding collapsible elements`);

  try
  {
    // If no collapsible elements are found, log info and return original markdown
    if (!markdown.includes(`???`))
    {
      eventLogger.logInfo(`No collapsible elements detected.`);
      return markdown;
    }

    // Log a warning about potential indentation changes
    eventLogger.logWarning(`Collapsible elements detected. The script will remove whitespace and indentation from the file. If the file contains codeblocks, verify the indentation afterwards.`);

    // Split markdown into lines
    let lines = markdown.split("\n");

    // Variable to store processed markdown with trimmed lines
    let tempReplacement: string = ``;

    // Trim whitespace from each line and reconstruct the markdown
    for (let element of lines)
    {
      element = element.includes("???") ? element.replace(`???`, "##").replaceAll(`"`, "").replaceAll(`**`, ``).trim() : element.trim(); // Replace collapsible elements with markdown headers
      tempReplacement = tempReplacement + `${element}\n`;
    }

    // Update markdown with trimmed lines
    markdown = tempReplacement;

    // Log successful conversion
    eventLogger.logInfo(`Changed collapsible elements to <title> elements.`);

    // Return the modified markdown
    return markdown;
  } catch (error)
  {
    // If an error occurs, log a warning and return the original markdown
    eventLogger.logWarning(`Unable to convert collapsible elements. Verify the resulting DITA file afterwards. (Error code: 101)\n${error}`);
    return markdown;
  }
};

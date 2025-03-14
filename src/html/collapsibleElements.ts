/**
 * Transforms collapsible elements in markdown by converting special syntax to markdown headers
 * 
 * @param markdown - The input markdown string to be processed
 * @param eventLogger - A logging object to record information and warnings during processing
 * @returns The modified markdown string with collapsible elements converted
 * 
 * @remarks
 * This function does the following:
 * 1. Detects collapsible elements using a specific regex pattern (??? "...)
 * 2. Trims whitespace and indentation from all lines
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
export const fixCollapsibleElements = (markdown: string, eventLogger: any) => 
{
    eventLogger.logInfo(`Finding collapsible elements`);

    try 
    {
        // Regex to find collapsible elements in the format: ??? "..."
        const findCollapsibleElements = /\?\?\?\s"[^\n]*/g;

        // If no collapsible elements are found, log info and return original markdown
        if (!findCollapsibleElements.test(markdown)) 
        {
            eventLogger.logInfo(`No collapsible elements detected.`);
            return markdown;
        }
    
        // Log a warning about potential indentation changes
        eventLogger.logWarning(`Collapsible elements detected. The script will remove whitespace and indentation from the file. If the file contains codeblocks, verify the indentation afterwards.`);
    
        // Split markdown into lines
        let lines = markdown.split('\n');
        
        // Variable to store processed markdown with trimmed lines
        let tempReplacement: string = ``;
    
        // Trim whitespace from each line and reconstruct the markdown
        for (let element of lines)
            tempReplacement = tempReplacement + `${element.trim()}\n`;
    
        // Update markdown with trimmed lines
        markdown = tempReplacement;
    
        // Find all collapsible elements using the regex
        let auxArray = [...markdown.match(findCollapsibleElements)]
    
        // Process each collapsible element
        for (let element of auxArray) 
        {
            // Check if the element contains bold formatting (**)
            if (/\*\*/.test(element)) 
            {
                // Remove ??? ", replace with ##
                tempReplacement = element.replace(/\?\?\?\s"\*\*/, `## `);
                // Remove closing quotation mark
                tempReplacement = tempReplacement.replace(/"/, ``);
                // Remove bold formatting
                tempReplacement = tempReplacement.replace(/\*\*/, ``);
            } 
            else 
            {
                // For non-bold elements, simply replace ??? " with ##
                tempReplacement = element.replace(/\?\?\?\s"/, `## `);
                // Remove closing quotation mark
                tempReplacement = tempReplacement.replace(/"/, ``);
            }
    
            // Replace the original collapsible element with the processed header
            markdown = markdown.replace(element, tempReplacement);
        }
    
        // Log successful conversion
        eventLogger.logInfo(`Changed collapsible elements to <title> elements.`);

        // Return the modified markdown
        return markdown;
    } 
    catch (error) 
    {
        // If an error occurs, log a warning and return the original markdown
        eventLogger.logWarning(`Unable to convert collapsible elements. Verify the resulting DITA file afterwards. (Error code: 101)\n${error}`)
        return markdown;
    }
}
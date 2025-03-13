import * as cheerio from 'cheerio';
import { simpleLogger } from '../md-dita';

/**
 * Converts HTML tables in an XML string to DITA XML format
 * 
 * @param xml - The input XML string containing HTML tables
 * @param eventLogger - A logging object to record information and warnings during conversion
 * @returns A modified XML string with HTML tables converted to DITA XML tables
 */
export const convertHtmlTables = (xml: string, eventLogger: simpleLogger): string => {
    // Load the entire XML into Cheerio for table detection
    const $xml = cheerio.load(xml, { xmlMode: true });
    const tables = $xml('table');

    // If no tables are found, return the original XML unchanged
    if (tables.length === 0) {
        eventLogger.logInfo("No tables found");
        return xml;
    }

    tables.each((i, tableEl) => {
        const tableHtml = $xml.html(tableEl);
        const convertedTable = htmlToDitaTable(unmergeCells(tableHtml), eventLogger);

        // Replace the original table with the converted one in the XML
        $xml(tableEl).replaceWith(convertedTable);
    });

    return $xml.html();
}

/**
 * Unmerges cells in an HTML table by expanding colspan and rowspan attributes
 * 
 * @param html - The HTML table string to process
 * @returns A modified HTML table string with merged cells expanded
 */
const unmergeCells = (html: string): string => {
    // Load the HTML string into Cheerio for DOM-like manipulation
    const $ = cheerio.load(html);

    // Remove column-related elements that might interfere with cell processing
    $('col, colgroup').remove();

    // Iterate through each row in the table
    $('tr').each((rowIndex, row) => {
        // Iterate through each cell (td or th) in the current row
        $(row).find('td, th').each((colIndex, cell) => {
            // Parse colspan and rowspan attributes, defaulting to 1 if not present
            const colspan = parseInt($(cell).attr('colspan') || '1');
            const rowspan = parseInt($(cell).attr('rowspan') || '1');

            // Check if the cell is inside the table header
            const isHeaderCell = $(cell).parents('thead').length > 0;

            // Handle colspan in header cells
            if (isHeaderCell && colspan > 1) {
                // Remove the colspan attribute
                $(cell).removeAttr('colspan');

                // Insert additional empty header cells to replace the merged cell
                for (let i = 1; i < colspan; i++) {
                    $(cell).after('<th></th>');
                }
            }

            // Handle rowspan by inserting cells in subsequent rows
            if (rowspan > 1) {
                // Remove the rowspan attribute
                $(cell).removeAttr('rowspan');

                // Track the current row while inserting additional cells
                let currentRow = $(row);
                for (let i = 1; i < rowspan; i++) {
                    // Get the next row or create a new one if it doesn't exist
                    const nextRow = currentRow.next('tr');
                    if (nextRow.length === 0) {
                        currentRow.after('<tr></tr>');
                    }

                    // Add a new cell to the next row
                    const newRow = currentRow.next('tr');
                    newRow.append(isHeaderCell ? '<th></th>' : '<td></td>');
                    currentRow = newRow;
                }
            }
        });
    });

    // Return just the table HTML, not the whole document
    return $.html('table');
}

/**
 * Converts an HTML table to a DITA XML table format
 * 
 * @param html - The HTML table string to convert
 * @param eventLogger - A logging object to record warnings during conversion
 * @returns A DITA XML table string
 */
function htmlToDitaTable(html: string, eventLogger: simpleLogger): string {
    try {
        // Create a single Cheerio instance for the entire table processing
        const $ = cheerio.load(html);

        // Preprocessing: remove and transform certain HTML elements
        // Replace <br> tags with spaces to preserve text flow
        $('br').replaceWith(' ');

        // Remove <strong> tags while keeping their content
        $('strong').each((i, elem) => {
            $(elem).replaceWith($(elem).html());
        });

        // Convert <a> tags to DITA <xref> tags, preserving href and content
        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            $(elem).replaceWith('<xref href="' + href + '">' + $(elem).html() + '</xref>');
        });

        const ditaTable: string[] = [];

        // Start building the DITA table structure
        ditaTable.push('<table>');

        // Determine the number of columns by counting cells in the first row
        const firstRow = $('tr').first();
        const colCount = firstRow.find('th, td').length;

        // Add table group with column specifications
        ditaTable.push('<tgroup cols="' + colCount + '">');
        for (let i = 0; i < colCount; i++) {
            ditaTable.push('<colspec colname="col' + (i + 1) + '"/>');
        }

        // Process table header (thead)
        if ($('thead').length > 0) {
            ditaTable.push('<thead>');

            // Process header rows directly with Cheerio
            $('thead tr').each((i, row) => {
                ditaTable.push('<row>');
                $(row).find('th, td').each((j, cell) => {
                    ditaTable.push('<entry><p>' + $(cell).html() + '</p></entry>');
                });
                ditaTable.push('</row>');
            });

            ditaTable.push('</thead>');
        }

        // Process table body (tbody)
        ditaTable.push('<tbody>');
        $('tbody tr').each((i, elem) => {
            ditaTable.push('<row>');
            $(elem)
                .find('td')
                .each((j, cell) => {
                    // Get cell content
                    const cellContent = $(cell).html() || '';
                    
                    // We'll reuse the same checking logic from wrapInPTags but inline
                    const wrappedContent = checkAndWrapPTags(cellContent);
                    
                    ditaTable.push('<entry>' + wrappedContent + '</entry>');
                });
            ditaTable.push('</row>');
        });
        ditaTable.push('</tbody>');

        // Close table group and table
        ditaTable.push('</tgroup>');
        ditaTable.push('</table>');

        return ditaTable.join('\n');
    } catch (error) {
        // Handle conversion errors by logging and returning a default empty table
        eventLogger.logWarning(`Unable to convert HTML table to DITA XML table. Ignoring HTML table. (Error Code: 106)\n${error}`);
        console.trace();
        return '<table outputclass="frame all rules all"><tgroup cols="0"></tgroup></table>';
    }
}

/**
 * Helper function to check if content needs p tags and wrap if needed
 * Maintains the same logic as the original wrapInPTags but avoids creating
 * a new Cheerio instance when possible
 */
function checkAndWrapPTags(content: string): string {
    // Simple regex check for opening p tag - this optimization avoids creating
    // a new Cheerio instance when clearly not needed
    if (content.includes('<p>')) {
        return content;
    }
    
    // For ambiguous cases, use the same Cheerio approach as the original
    const $ = cheerio.load(content);
    if ($('p').length === 0) {
        return '<p>' + content + '</p>';
    }
    
    return content;
}
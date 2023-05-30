import * as cheerio from 'cheerio';

export const convertHtmlTables = (xml: string, eventLogger: any): string =>
{
    if (!/<table[\s\S]+?<\/table>/g.test(xml))
    {
        eventLogger.logInfo("No tables found");
        return xml;
    }

    let tableArray = [...xml.match(/<table[\s\S]+?<\/table>/g)]; // Put all tables in an array

    for (let table of tableArray)
        xml = xml.replace(table, htmlToDitaTable(unmergeCells(table), eventLogger));

    return xml;
}

const  unmergeCells = (html: string): string =>
{
    // Load the HTML string into Cheerio
    let $ = cheerio.load(html);

    // Remove col and colgroup elements
    $('col, colgroup').remove();

    // Find the table element
    let table = $('table');

    // Loop through each row
    table.find('tr').each((rowIndex, row) =>
    {
        // Loop through each cell in the row
        $(row).find('td, th').each((colIndex, cell) =>
        {
            let colspan = parseInt($(cell).attr('colspan') || '1');
            let rowspan = parseInt($(cell).attr('rowspan') || '1');

            // Check if the cell is inside the thead element
            let isHeaderCell = $(cell).parents('thead').length > 0;

            // Unmerge cells with colspan inside thead
            if (isHeaderCell && colspan > 1)
            {
                // Remove the colspan attribute
                $(cell).removeAttr('colspan');

                // Insert individual cells to replace the merged cell
                for (let i = 1; i < colspan; i++)
                {
                    $(cell).after('<th></th>');
                }
            }

            // Unmerge cells with rowspan
            if (rowspan > 1)
            {
                // Remove the rowspan attribute
                $(cell).removeAttr('rowspan');

                // Insert individual cells in subsequent rows
                let currentRow = $(row);
                for (let i = 1; i < rowspan; i++)
                {
                    let nextRow = currentRow.next('tr');
                    if (nextRow.length === 0)
                    {
                        // Insert a new row if it doesn't exist
                        currentRow.after('<tr></tr>');
                    }

                    let newRow = currentRow.next('tr');
                    newRow.append(isHeaderCell ? '<th></th>' : '<td></td>');
                    currentRow = newRow;
                }
            }
        });
    });

    let result = $.html()
    // Return the modified HTML
    return result.replace(/<html><head><\/head><body>/, ``).replace(/<\/body><\/html>/, ``);;
}

function htmlToDitaTable(html: string, eventLogger: any): string
{
    try
    {
        const $ = cheerio.load(html);

        // Remove br and strong tags while preserving their contents
        $('br').replaceWith(' ');
        $('strong').each((i, elem) =>
        {
            $(elem).replaceWith($(elem).html());
        });

        // Replace a tags with xref tags while preserving href attributes and inner tags
        $('a').each((i, elem) =>
        {
            const href = $(elem).attr('href');
            $(elem).replaceWith('<xref href="' + href + '">' + $(elem).html() + '</xref>');
        });

        const ditaTable: string[] = [];

        // Start table
        ditaTable.push('<table>');

        // Add colspecs
        let colCountAux = html.match(/<tr[\s\S]+?<\/tr>/)[0]
        let colCount = (colCountAux.match(/<th>/g) || []).length;
        //let colCount = $('thead tr th').length || $('thead tr td').length;
        
        ditaTable.push('<tgroup cols="' + colCount + '">');
        for (let i = 0; i < colCount; i++)
        {
            ditaTable.push('<colspec colname="col' + (i + 1) + '"/>');
        }

        // Add thead
        colCountAux = html.match(/<thead[\s\S]+?<\/thead>/)[0]
        let theadAux = [...colCountAux.match(/<tr[\s\S]+?<\/tr>/g)]

        ditaTable.push('<thead>');

        for(let element of theadAux)
        {
            element = element.replace(/<tr>/g, `<row>`)
            .replace(/<\/tr>/g, `</row>`)
            .replace(/<th>/g, `<entry><p>`)
            .replace(/<\/th>/g, `</p></entry>`);

            ditaTable.push(element);
        }

        ditaTable.push('</thead>');

        console.log(ditaTable)

        // Add tbody
        ditaTable.push('<tbody>');
        $('tbody tr').each((i, elem) =>
        {
            ditaTable.push('<row>');
            $(elem)
                .find('td')
                .each((j, cell) =>
                {
                    ditaTable.push('<entry>' + wrapInPTags($(cell).html()) + '</entry>');
                });
            ditaTable.push('</row>');
        });
        ditaTable.push('</tbody>');

        // End table
        ditaTable.push('</tgroup>');
        ditaTable.push('</table>');

        return ditaTable.join('\n');
    } catch (error)
    {
        eventLogger.logWarning(`Unable to convert HTML table to DITA XML table. Ignoring HTML table. (Error Code: 106)\n${error}`);
        console.trace();
        return '<table outputclass="frame all rules all"><tgroup cols="0"></tgroup></table>';
    }
}

function wrapInPTags(content: string): string
{
    const $ = cheerio.load(content);
    if ($('p').length === 0)
    {
        return '<p>' + content + '</p>';
    } else
    {
        return content;
    }
}
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
        xml = xml.replace(table, htmlToDitaTable(table, eventLogger));

    return xml;
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
        const colCount = $('thead th').length || $('thead td').length;
        ditaTable.push('<tgroup cols="' + colCount + '">');
        for (let i = 0; i < colCount; i++)
        {
            ditaTable.push('<colspec colname="col' + (i + 1) + '"/>');
        }

        // Add thead
        ditaTable.push('<thead>');
        ditaTable.push('<row>');
        $('thead th, thead td').each((i, elem) =>
        {
            ditaTable.push('<entry>' + wrapInPTags($(elem).html()) + '</entry>');
        });
        ditaTable.push('</row>');
        ditaTable.push('</thead>');

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
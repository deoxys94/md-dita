export const headerColspecs = (tableReplacement: string) =>
{
    let auxString = tableReplacement.match(/<thead[\s\S]+?<\/thead>/)[0];
    let auxHeaders = `` + `<tgroup cols="${auxString.match(/<entry/g).length}">\n`

    for (let j = 0; j < auxString.match(/<entry/g).length; j++)
        auxHeaders = auxHeaders + `<colspec colname="c${j}" colwidth="1*"/>\n`;

    return auxHeaders;
}

export const firstRowColspecs = (tableReplacement: string) =>
{
    let auxString = tableReplacement.match(/<tbody[\s\S]+?<\/tbody>/)[0];
    auxString = auxString.match(/<row[\s\S]+?<\/row>/)[0];

    if (!/colspan=\"(.*?)\"/.test(auxString))
    {
        console.warn(`[Warning] Unable to generate colspecs.`);
        return `<tgroup cols="1">\n<colspec colname="c1" colwidth="1*"/>\n`
    }

    let auxColumns = [...auxString.match(/colspan=\"(.*?)\"/g)];
    let totalColNumber = 0;

    for (let j = 0; j < auxColumns.length; j++)
    {
        auxColumns[j] = auxColumns[j].substring(9, auxColumns[j].length - 1);

        totalColNumber = totalColNumber + (Number(auxColumns[j]) - 1);
    }

    totalColNumber = totalColNumber + auxString.match(/<entry/g).length;

    let auxHeaders = `` + `<tgroup cols="${totalColNumber}">\n`;

    for (let j = 0; j < totalColNumber; j++)
    {
        auxHeaders = auxHeaders + `<colspec colname="c${j}" colwidth="1*"/>\n`;
    }

    return auxHeaders;
}

export const convertHtmlTables = (xml: string) =>
{
    let auxHeaders: string; // Slice to generate colspecs
    let tableArray = [];
    let tableReplacement: string;
    let hasTheadTag = false;
    let hasTbodyTag = false;
    let hasThTag = false;

    if (!/<table[\s\S]+?<\/table>/g.test(xml))
    { // Check if there are any tables
        console.info("[Info] No tables found");
        return xml;
    }

    tableArray = [...xml.match(/<table[\s\S]+?<\/table>/g)]; // Put all tables in an array

    for (let table of tableArray) // Convert each table
    {
        tableReplacement = table;

        // Do the pre-checks before splitting the table
        hasTbodyTag = /<tbody[^>]*>/.test(table) ? true : false;
        hasTheadTag = /<thead[^>]*>/.test(table) ? true : false;
        hasThTag = /<th[^>]*>/.test(table) ? true : false;

        // Insert the tags as needed
        // Insert head tag if the table has only the th tag somewhere
        if (!hasTheadTag && hasThTag)
        {
            tableReplacement = tableReplacement.replace(/<tr>/, `<thead>\n<tr>\n`);
            tableReplacement = tableReplacement.replace(/<\/tr>/, `</tr>\n</thead>\n`);
            hasTheadTag = true;
        }

        // Insert body tag if the table has the head tag
        if (!hasTbodyTag && hasTheadTag)
        {
            tableReplacement = tableReplacement.replace(/<\/thead>/, `</thead>\n<tbody>\n`);
            tableReplacement = tableReplacement.replace(/<\/table>/, `</tbody>\n</table>\n`);
        }

        if (hasTbodyTag && !hasTheadTag)
        {
            tableReplacement = tableReplacement.replace(/<tbody>/, `<thead>\n<row><\/row><\/thead>\n<tbody>\n`);
        }

        // Delete tags and attributes that don't exist in DITA
        tableReplacement = tableReplacement.replace(/<\/?colspec[^>]*>/g, ``);
        tableReplacement = tableReplacement.replace(/<col[^>]*>/g, ``);
        tableReplacement = tableReplacement.replace(/<tr>/g, `<row>`);
        tableReplacement = tableReplacement.replace(/<\/tr>/g, `</row>`);
        tableReplacement = tableReplacement.replace(/<td\s/g, `<entry `);
        tableReplacement = tableReplacement.replace(/<td>/g, `<entry>`);
        tableReplacement = tableReplacement.replace(/<\/td>/g, `</entry>`);
        tableReplacement = tableReplacement.replace(/<th\s/g, `<entry `);
        tableReplacement = tableReplacement.replace(/<th>/g, `<entry>`);
        tableReplacement = tableReplacement.replace(/<\/th>/g, `</entry>`);
        tableReplacement = tableReplacement.replace(/<table[^>]*>/g, `<table frame="all" rowsep="1" colsep="1">\n<colspec-needed>\n`);

        // Generate colspecs
        auxHeaders = ``; // Clean variable

        auxHeaders = !/colspan=\"(.*?)\"/.test(tableReplacement) ? headerColspecs(tableReplacement) : firstRowColspecs(tableReplacement);

        tableReplacement = tableReplacement.replace(/\scolspan=\"(.*?)\"/g, ` colname="this_cell_needs_to_be_merged_colspan"`);
        tableReplacement = tableReplacement.replace(/\srowspan=\"(.*?)\"/g, ` audience="this_cell_needs_to_be_merged_rowspan"`);
        tableReplacement = tableReplacement.replace(/\sstyle=\"(.*?)\"/g, ``);
        tableReplacement = tableReplacement.replace(/\swidth=\"(.*?)\"/g, ``);
        tableReplacement = tableReplacement.replace(/<colspec-needed>/, auxHeaders)
        tableReplacement = tableReplacement.replace(/<\/table>/, `</tgroup>\n</table>`)

        xml = xml.replace(table, tableReplacement);
    }

    console.info(`[Info] Converted all tables to DITA XML tables.`);

    return xml;
}
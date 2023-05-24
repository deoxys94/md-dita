export const convertHtmlTables = (xml: string, eventLogger: any): string => {
    if (!/<table[\s\S]+?<\/table>/g.test(xml)) {
        eventLogger.logInfo("No tables found");
        return xml;
    }

    let tableArray = [...xml.match(/<table[\s\S]+?<\/table>/g)]; // Put all tables in an array

    for (let table of tableArray)
        xml = xml.replace(table, processTables(table, eventLogger));

    return xml;
}

const processTables = (htmlTable: string, eventLogger: any): string => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlTable, 'text/html');
        const table = doc.querySelector('table');
        const ditaTable = document.createElement('table');
        ditaTable.setAttribute('outputclass', 'frame all rules all');

        // Create tgroup element
        const tgroup = document.createElement('tgroup');
        tgroup.setAttribute('cols', table!.rows[0].cells.length.toString());
        ditaTable.appendChild(tgroup);

        // Create colspec elements
        for (let i = 0; i < table!.rows[0].cells.length; i++) {
            const colspec = document.createElement('colspec');
            colspec.setAttribute('colname', `col${i}`);
            colspec.setAttribute('colnum', (i + 1).toString());
            tgroup.appendChild(colspec);
        }

        // Create thead element
        const thead = document.createElement('thead');
        tgroup.appendChild(thead);

        // Create row element for header row
        const headerRow = document.createElement('row');
        thead.appendChild(headerRow);

        // Create entry elements for header row
        for (let cell of table!.rows[0].cells) {
            const entry = document.createElement('entry');

            // Wrap cell contents in a <p> element if the cell doesn't already contain any <p> elements
            if (cell.querySelectorAll('p').length === 0) {
                const p = document.createElement('p');
                entry.appendChild(p);
                transformHtmlToDitaXml(cell, p);
            } else {
                transformHtmlToDitaXml(cell, entry);
            }

            // Handle merged cells
            if (cell.colSpan > 1) {
                entry.setAttribute('namest', `col${cell.cellIndex}`);
                entry.setAttribute('nameend', `col${cell.cellIndex + cell.colSpan - 1}`);
            }
            if (cell.rowSpan > 1) {
                entry.setAttribute('morerows', (cell.rowSpan - 1).toString());
            }

            headerRow.appendChild(entry);
        }

        // Create tbody element
        const tbody = document.createElement('tbody');
        tgroup.appendChild(tbody);

        // Create row elements for body rows
        for (let i = 1; i < table!.rows.length; i++) {
            const row = document.createElement('row');
            tbody.appendChild(row);

            // Create entry elements for body row
            for (let cell of table!.rows[i].cells) {
                const entry = document.createElement('entry');

                // Wrap cell contents in a <p> element if the cell doesn't already contain any <p> elements
                if (cell.querySelectorAll('p').length === 0) {
                    const p = document.createElement('p');
                    entry.appendChild(p);
                    transformHtmlToDitaXml(cell, p);
                } else {
                    transformHtmlToDitaXml(cell, entry);
                }

                // Handle merged cells
                if (cell.colSpan > 1) {
                    entry.setAttribute(
                        'namest',
                        `col${cell.cellIndex}`
                    );
                    entry.setAttribute(
                        'nameend',
                        `col${cell.cellIndex + cell.colSpan - 1}`
                    );
                }
                if (cell.rowSpan > 1) {
                    entry.setAttribute(
                        'morerows',
                        (cell.rowSpan - 1).toString()
                    );
                }

                row.appendChild(entry);
            }
        }

        // Format the DITA XML table with each tag on a separate line and colspec elements as self-closing tags
        let formattedDitaTable = ditaTable.outerHTML;
        formattedDitaTable = formattedDitaTable.replace(/<colspec([^>]*)><\/colspec>/g, '<colspec$1/>');
        formattedDitaTable = formattedDitaTable.replace(/<term>/g, '');
        formattedDitaTable = formattedDitaTable.replace(/<\/term>/g, '');
        formattedDitaTable = formattedDitaTable.replace(/></g, '>\n<');

        return formattedDitaTable;
    } catch (error)
    {
        eventLogger.logWarning(`Unable to convert HTML table to DITA XML table. Ignoring HTML table. (Error Code: 106)\n${error}`);
        return '<table outputclass="frame all rules all"><tgroup cols="0"></tgroup></table>';
    }
}

// Helper function to transform HTML tags inside a table cell to DITA XML
const transformHtmlToDitaXml = (htmlElement: HTMLElement, ditaElement: HTMLElement) => {
    for (let child of htmlElement.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            ditaElement.appendChild(document.createTextNode(child.textContent!));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            let ditaChild: HTMLElement | undefined;

            switch ((child as HTMLElement).tagName) {
                case 'B':
                case 'STRONG':
                    ditaChild = document.createElement('b');
                    break;
                case 'I':
                case 'EM':
                    ditaChild = document.createElement('i');
                    break;
                case 'U':
                    ditaChild = document.createElement('u');
                    break;
                case 'BR':
                    ditaChild = document.createElement('br');
                    break;
                case 'A':
                    ditaChild = document.createElement('xref');
                    ditaChild.setAttribute(
                        'href',
                        (child as HTMLAnchorElement).href
                    );
                    break;
                default:
                    ditaChild = document.createElement((child as HTMLElement).tagName.toLowerCase());
                    break;
            }

            if (ditaChild) {
                transformHtmlToDitaXml(child as HTMLElement, ditaChild);
                ditaElement.appendChild(ditaChild);
            }
        }
    }
}

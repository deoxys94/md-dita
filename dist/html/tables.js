"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHtmlTables = void 0;
const convertHtmlTables = (htmlTable) => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlTable, 'text/html');
        const table = doc.querySelector('table');
        const ditaTable = document.createElement('table');
        ditaTable.setAttribute('outputclass', 'frame all rules all');
        const tgroup = document.createElement('tgroup');
        tgroup.setAttribute('cols', table.rows[0].cells.length.toString());
        ditaTable.appendChild(tgroup);
        for (let i = 0; i < table.rows[0].cells.length; i++) {
            const colspec = document.createElement('colspec');
            colspec.setAttribute('colname', `col${i}`);
            colspec.setAttribute('colnum', (i + 1).toString());
            tgroup.appendChild(colspec);
        }
        const thead = document.createElement('thead');
        tgroup.appendChild(thead);
        const headerRow = document.createElement('row');
        thead.appendChild(headerRow);
        for (let cell of table.rows[0].cells) {
            const entry = document.createElement('entry');
            const p = document.createElement('p');
            entry.appendChild(p);
            transformHtmlToDitaXml(cell, p);
            if (cell.colSpan > 1) {
                entry.setAttribute('namest', `col${cell.cellIndex}`);
                entry.setAttribute('nameend', `col${cell.cellIndex + cell.colSpan - 1}`);
            }
            if (cell.rowSpan > 1) {
                entry.setAttribute('morerows', (cell.rowSpan - 1).toString());
            }
            headerRow.appendChild(entry);
        }
        const tbody = document.createElement('tbody');
        tgroup.appendChild(tbody);
        for (let i = 1; i < table.rows.length; i++) {
            const row = document.createElement('row');
            tbody.appendChild(row);
            for (let cell of table.rows[i].cells) {
                const entry = document.createElement('entry');
                const p = document.createElement('p');
                entry.appendChild(p);
                transformHtmlToDitaXml(cell, p);
                if (cell.colSpan > 1) {
                    entry.setAttribute('namest', `col${cell.cellIndex}`);
                    entry.setAttribute('nameend', `col${cell.cellIndex + cell.colSpan - 1}`);
                }
                if (cell.rowSpan > 1) {
                    entry.setAttribute('morerows', (cell.rowSpan - 1).toString());
                }
                row.appendChild(entry);
            }
        }
        let formattedDitaTable = ditaTable.outerHTML;
        formattedDitaTable = formattedDitaTable.replace(/></g, '>\n<');
        formattedDitaTable = formattedDitaTable.replace(/<colspec([^>]*)><\/colspec>/g, '<colspec$1/>');
        return formattedDitaTable;
    }
    catch (error) {
        console.error(error);
        return '<table outputclass="frame all rules all"><tgroup cols="0"></tgroup></table>';
    }
};
exports.convertHtmlTables = convertHtmlTables;
const transformHtmlToDitaXml = (htmlElement, ditaElement) => {
    for (let child of htmlElement.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            ditaElement.appendChild(document.createTextNode(child.textContent));
        }
        else if (child.nodeType === Node.ELEMENT_NODE) {
            let ditaChild;
            switch (child.tagName) {
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
                    ditaChild.setAttribute('href', child.href);
                    break;
                default:
                    ditaChild = document.createElement(child.tagName.toLowerCase());
                    break;
            }
            if (ditaChild) {
                transformHtmlToDitaXml(child, ditaChild);
                ditaElement.appendChild(ditaChild);
            }
        }
    }
};

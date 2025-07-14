export const fixCollapsibleElements = (markdown: string) =>
{
    const findCollapsibleElements = /\?\?\?\s"[^\n]*/g;

    if (!findCollapsibleElements.test(markdown))
    {
        console.info(`[Info] No collapsible elements detected.`);
        return markdown;
    }

    console.warn(`[Warning] Collapsible elements detected. The script will remove whitespace and indentation from the file. If the file contains codeblocks, verify the indentation afterwards.`);

    let lines = markdown.split('\n');
    let tempReplacement: string;

    for (let element of lines)
        tempReplacement = tempReplacement + `${element.trim()}\n`; // Removing whitespace

    markdown = tempReplacement;

    let auxArray = [...markdown.match(findCollapsibleElements)]

    for (let element of auxArray)
    {

        if (/\*\*/.test(element))
        {
            tempReplacement = element.replace(/\?\?\?\s"\*\*/, `## `);
            tempReplacement = tempReplacement.replace(/"/, ``);
            tempReplacement = tempReplacement.replace(/\*\*/, ``);
        } else
        {
            tempReplacement = element.replace(/\?\?\?\s"/, `## `);
            tempReplacement = tempReplacement.replace(/"/, ``);
        }

        markdown = markdown.replace(element, tempReplacement);
    }

    console.info(`[Info] Changed collapsible elements to <title> elements.`);

    return markdown;
}
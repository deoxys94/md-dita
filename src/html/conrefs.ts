export const findConrefs = (markdown: string) =>
{
    const regexConref = /--8<--\s"(.*?)"/g;

    if (!regexConref.test(markdown))
    {
        console.info(`[Info] No conrefs detected.`);
        return markdown;
    }

    let tempReplacement: string;
    let auxArray = [...markdown.match(regexConref)];

    for (let element of auxArray)
    {
        tempReplacement = element.replace(/--8<--\s/, ``);
        markdown = markdown.replace(element, `<draft-comment>Import the contents of ${tempReplacement} here.</draft-comment>\n`);
    }

    console.info(`[Info] Replaced all conrefs.`);
    return markdown;
}
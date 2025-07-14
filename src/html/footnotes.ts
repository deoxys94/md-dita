export const fixFootnotes = (markdown: string) =>
{
    const findFootnotes = /(\*\*Footnotes:\*\*)([\s\S]*)/;

    if (!findFootnotes.test(markdown))
    {
        console.info(`[Info] No footnotes detected.`);
        return markdown;
    }

    let tempReplacement: string;
    let auxArray = [...markdown.match(findFootnotes)];

    markdown = markdown.replace(auxArray[0], `<!-- Fix footnotes manually \n ${tempReplacement} -->\n`);

    console.info(`[Info] Commented out footnotes.`);
    return markdown;
}
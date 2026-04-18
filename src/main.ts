#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { MdDita } from "./md-dita";
import { FlavorType } from "./types";

const VALID_FLAVORS = Object.values(FlavorType) as string[];
const USAGE = `Usage: node md-dita.js --input <file> --type <concept|reference|task> [--output <file>] [--flavor <commonmark|gfm|mkdocs|docusaurus>] [--no-html-cleanup]`;

const main = async () =>
{
    const args = process.argv;

    // Get the index of the --input flag
    const inputIndex = args.indexOf('--input');
    // Get the index of the --type flag
    const typeIndex = args.indexOf('--type');
    // Get the index of the --output flag
    const outputIndex = args.indexOf('--output');
    // Get the index of the --flavor flag
    const flavorIndex = args.indexOf('--flavor');

    // Validate --input flag
    if (inputIndex === -1 || args[inputIndex + 1] === undefined)
    {
        console.error(`Missing --input flag.\n${USAGE}`);
        process.exit(1);
    }

    // Validate --type flag
    if (typeIndex === -1 || args[typeIndex + 1] === undefined)
    {
        console.error(`Missing --type flag.\n${USAGE}`);
        process.exit(1);
    }

    // Resolve and validate --flavor flag (default: commonmark)
    const flavorRaw = flavorIndex !== -1 ? args[flavorIndex + 1] : FlavorType.CommonMark;
    if (!VALID_FLAVORS.includes(flavorRaw))
    {
        console.error(`Invalid --flavor value: "${flavorRaw}". Valid flavors: ${VALID_FLAVORS.join(', ')}\n${USAGE}`);
        process.exit(1);
    }
    const flavor = flavorRaw as FlavorType;

    // --no-html-cleanup disables HTML table/note conversion
    const htmlCleanup = !args.includes('--no-html-cleanup');

    // Read the MD file and store it
    let fileContents = readFileSync(args[inputIndex + 1], { encoding: 'utf8', flag: 'r' });

    // Initialize the MdDita class
    const mdToDita = new MdDita({ flavor, htmlCleanup, verbose: true });

    // Convert the file depending on the selected type
    switch (args[typeIndex + 1])
    {
        case 'concept':
            fileContents = await mdToDita.mdToConcept(fileContents);
            break;
        case 'reference':
            fileContents = await mdToDita.mdToReference(fileContents);
            break;
        case 'task':
            fileContents = await mdToDita.mdToTask(fileContents);
            break;
        default:
            console.error(`Invalid type: "${args[typeIndex + 1]}". Valid types: concept, reference, task\n${USAGE}`);
            process.exit(1);
    }

    // Resolve output path (--output flag or default to output.xml)
    const outputPath = (outputIndex !== -1 && args[outputIndex + 1] !== undefined)
        ? args[outputIndex + 1]
        : `output.xml`;

    // Write the converted file
    writeFileSync(outputPath, fileContents);
    console.log(`File saved in ${outputPath}`)
};

main().catch((error) =>
{
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fatal error: ${message}`);
    process.exit(1);
});

#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { MdDita } from "./md-dita";

const USAGE = `Usage: node md-dita.js --input <file> --type <concept|reference|task>`;

const main = async () =>
{
    // Get the index of the --input flag
    const inputIndex = process.argv.indexOf('--input');
    // Get the index of the --type flag
    const typeIndex = process.argv.indexOf('--type');

    // Validate --input flag
    if (inputIndex === -1 || process.argv[inputIndex + 1] === undefined)
    {
        console.error(`Missing --input flag.\n${USAGE}`);
        process.exit(1);
    }

    // Validate --type flag
    if (typeIndex === -1 || process.argv[typeIndex + 1] === undefined)
    {
        console.error(`Missing --type flag.\n${USAGE}`);
        process.exit(1);
    }

    // Read the MD file and store it
    let fileContents = readFileSync(process.argv[inputIndex + 1], { encoding: 'utf8', flag: 'r' });

    // Initialize the MdDita class
    const mdToDita = new MdDita(true);

    // Convert the file depending on the selected type
    switch (process.argv[typeIndex + 1])
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
            console.error(`Invalid type: "${process.argv[typeIndex + 1]}". Valid types: concept, reference, task\n${USAGE}`);
            process.exit(1);
    }

    // Write the converted file
    writeFileSync(`output.xml`, fileContents);
};

main().catch((error) =>
{
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fatal error: ${message}`);
    process.exit(1);
});

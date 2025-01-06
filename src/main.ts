import { readFileSync, writeFileSync } from "fs";
import { MdDita } from "./md-dita";

// Get the index of the --input flag
const inputIndex = process.argv.indexOf('--input');
// Get the index of the --type flag
const typeIndex = process.argv.indexOf('--type');

// Read the MD file and store it
let fileContents = readFileSync(process.argv[inputIndex + 1], { encoding: 'utf8', flag: 'r' });

// Initialize the MdDita class
const mdToDita = new MdDita(true);

// Convert the file depending on the selected type

switch (process.argv[typeIndex + 1])
{
    case 'concept':
        fileContents = mdToDita.mdToConcept(fileContents);
        break;
    case 'reference':
        fileContents = mdToDita.mdToReference(fileContents);
        break;
    case 'task':
        fileContents = mdToDita.mdToTask(fileContents);
        break;
    default:
        console.error(`Invalid type: ${process.argv[typeIndex + 1]}`);
        process.exit(1);
}

// Write the converted file
writeFileSync(`output.xml`, fileContents);

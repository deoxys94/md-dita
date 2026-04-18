#!/usr/bin/env bun
import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync, existsSync, copyFileSync } from "fs";
import { join, extname, basename, dirname, resolve, sep } from "path";
import { createInterface } from "readline";
import { MdDita } from "./md-dita";
import { FlavorType, InteractiveManifest, TopicTypeString } from "./types";
import { detectTopicType } from "./cli/autoDetect";
import { loadManifest, isPass2, runInteractivePass1, MANIFEST_FILENAME } from "./cli/interactiveMode";

const VALID_FLAVORS = Object.values(FlavorType) as string[];
const USAGE = `Usage: md-dita --input <file|folder> --type <concept|reference|task|auto> [--interactive] [--output <file|folder>] [--flavor <commonmark|gfm|mkdocs|docusaurus>] [--no-html-cleanup] [--recursive]`;

function walkDir(dir: string, base: string, mdFiles: string[], otherFiles: string[]): void
{
    for (const entry of readdirSync(dir, { withFileTypes: true }))
    {
        const rel = base ? join(base, entry.name) : entry.name;
        if (entry.isDirectory())
        {
            walkDir(join(dir, entry.name), rel, mdFiles, otherFiles);
        }
        else if (extname(entry.name).toLowerCase() === '.md')
        {
            mdFiles.push(rel);
        }
        else
        {
            otherFiles.push(rel);
        }
    }
}

async function pressEnterToContinue(): Promise<void>
{
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    await new Promise<void>(res => rl.question('', () => { rl.close(); res(); }));
}

async function convertFile(
    mdToDita: MdDita,
    src: string,
    type: TopicTypeString | 'auto'
): Promise<{ result: string; detectedType: TopicTypeString }>
{
    const detectedType: TopicTypeString = type === 'auto' ? detectTopicType(src) : type;
    let result: string;
    switch (detectedType)
    {
        case 'concept':
            result = await mdToDita.mdToConcept(src);
            break;
        case 'reference':
            result = await mdToDita.mdToReference(src);
            break;
        case 'task':
        default:
            result = await mdToDita.mdToTask(src);
            break;
    }
    return { result, detectedType };
}

async function runBatchFromManifest(
    manifest: InteractiveManifest,
    inputDir: string,
    outputDir: string,
    flavor: FlavorType,
    htmlCleanup: boolean
): Promise<void>
{
    const mdToDita = new MdDita({ flavor, htmlCleanup, verbose: true });
    let converted = 0;
    let failed = 0;

    for (const [relForward, topicTypeStr] of Object.entries(manifest.files))
    {
        // Convert forward-slash keys to OS path separators
        const rel = relForward.replace(/\//g, sep);
        const srcPath = join(inputDir, rel);

        if (!existsSync(srcPath))
        {
            console.warn(`Skipped (file not found): ${relForward}`);
            failed++;
            continue;
        }

        if (!['concept', 'reference', 'task'].includes(topicTypeStr))
        {
            console.warn(`Skipped (invalid type "${topicTypeStr}" in manifest): ${relForward}`);
            failed++;
            continue;
        }

        try
        {
            const src = readFileSync(srcPath, { encoding: 'utf8', flag: 'r' });
            const { result } = await convertFile(mdToDita, src, topicTypeStr as TopicTypeString);

            if (!result)
            {
                console.warn(`Skipped (empty output): ${relForward}`);
                failed++;
                continue;
            }

            const relOut = join(dirname(rel), basename(rel, extname(rel)) + '.xml');
            const outFilePath = join(outputDir, relOut);
            mkdirSync(dirname(outFilePath), { recursive: true });
            writeFileSync(outFilePath, result);
            console.log(`Converted [${topicTypeStr}]: ${relForward} → ${relOut.replace(/\\/g, '/')}`);
            converted++;
        }
        catch (err)
        {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Failed: ${relForward}: ${msg}`);
            failed++;
        }
    }

    const manifestPath = join(outputDir, MANIFEST_FILENAME);
    console.log(`\nBatch complete: ${converted} converted, ${failed} failed.`);
    console.log(`Manifest retained at: ${manifestPath}`);
    console.log(`Delete it or re-run with --interactive to regenerate.`);
    process.exit(failed > 0 ? 1 : 0);
}

const main = async () =>
{
    const args = process.argv;

    const inputIndex = args.indexOf('--input');
    const typeIndex = args.indexOf('--type');
    const outputIndex = args.indexOf('--output');
    const flavorIndex = args.indexOf('--flavor');
    const interactive = args.includes('--interactive');
    const htmlCleanup = !args.includes('--no-html-cleanup');
    const recursive = args.includes('--recursive');

    // Validate --input flag
    if (inputIndex === -1 || args[inputIndex + 1] === undefined)
    {
        console.error(`Missing --input flag.\n${USAGE}`);
        process.exit(1);
    }

    // --type is required unless --interactive is used
    if (!interactive && (typeIndex === -1 || args[typeIndex + 1] === undefined))
    {
        console.error(`Missing --type flag.\n${USAGE}`);
        process.exit(1);
    }

    const typeRaw = typeIndex !== -1 ? args[typeIndex + 1] : undefined;

    if (typeRaw !== undefined && !['concept', 'reference', 'task', 'auto'].includes(typeRaw))
    {
        console.error(`Invalid type: "${typeRaw}". Valid types: concept, reference, task, auto\n${USAGE}`);
        process.exit(1);
    }

    // Warn if --type is given alongside --interactive (interactive wins)
    if (interactive && typeRaw !== undefined)
    {
        console.warn(`Warning: --type is ignored when --interactive is used.`);
    }

    // Resolve and validate --flavor (default: commonmark)
    const flavorRaw = flavorIndex !== -1 ? args[flavorIndex + 1] : FlavorType.CommonMark;
    if (!VALID_FLAVORS.includes(flavorRaw))
    {
        console.error(`Invalid --flavor value: "${flavorRaw}". Valid flavors: ${VALID_FLAVORS.join(', ')}\n${USAGE}`);
        process.exit(1);
    }
    const flavor = flavorRaw as FlavorType;

    const inputPath = args[inputIndex + 1];
    const inputStat = statSync(inputPath);

    // --interactive requires a directory input
    if (interactive && inputStat.isFile())
    {
        console.error(`--interactive requires --input to be a directory.`);
        process.exit(1);
    }

    // -------------------------------------------------------------------------
    // DIRECTORY MODE
    // -------------------------------------------------------------------------
    if (inputStat.isDirectory())
    {
        if (outputIndex === -1 || args[outputIndex + 1] === undefined)
        {
            console.error(`--output is required when --input is a directory.\n${USAGE}`);
            process.exit(1);
        }

        const outputPath = args[outputIndex + 1];

        if (existsSync(outputPath) && statSync(outputPath).isFile())
        {
            console.error(`--output must be a directory when --input is a directory.`);
            process.exit(1);
        }

        mkdirSync(outputPath, { recursive: true });

        // Discover files
        let mdFiles: string[];
        let otherFiles: string[];

        if (recursive)
        {
            mdFiles = [];
            otherFiles = [];
            walkDir(inputPath, '', mdFiles, otherFiles);
        }
        else
        {
            mdFiles = readdirSync(inputPath)
                .filter(f => statSync(join(inputPath, f)).isFile() && extname(f).toLowerCase() === '.md');
            otherFiles = [];
        }

        // -----------------------------------------------------------------------
        // INTERACTIVE MODE
        // -----------------------------------------------------------------------
        if (interactive)
        {
            const manifest = loadManifest(outputPath);

            if (isPass2(manifest, inputPath))
            {
                // Pass 2: convert using manifest
                await runBatchFromManifest(manifest!, inputPath, outputPath, flavor, htmlCleanup);
            }
            else
            {
                // Pass 1: detect types, write manifest
                if (mdFiles.length === 0)
                {
                    console.warn(`No .md files found in input directory.`);
                    process.exit(0);
                }
                runInteractivePass1(inputPath, outputPath, mdFiles, flavor, recursive);
                process.exit(0);
            }
            return;
        }

        // -----------------------------------------------------------------------
        // BATCH MODE (standard or auto)
        // -----------------------------------------------------------------------
        const type = typeRaw as string;

        if (mdFiles.length === 0)
        {
            console.warn(`No .md files found in input directory.`);
            process.exit(0);
        }

        // Auto-mode: warn and ask for confirmation before converting
        if (type === 'auto')
        {
            console.warn(
                `\nWARNING: Auto-detect mode infers topic type from file content.` +
                `\n  tables → reference  |  top-level ordered lists → task  |  else → concept` +
                `\nResults may be inaccurate. Review output before use.` +
                `\n\nPress Enter to continue, or Ctrl+C to abort...`
            );
            await pressEnterToContinue();
        }

        const mdToDita = new MdDita({ flavor, htmlCleanup, verbose: true });
        let converted = 0;
        let copied = 0;
        let failed = 0;

        for (const rel of mdFiles)
        {
            try
            {
                const src = readFileSync(join(inputPath, rel), { encoding: 'utf8', flag: 'r' });
                const { result, detectedType } = await convertFile(mdToDita, src, type as TopicTypeString | 'auto');

                if (!result)
                {
                    console.warn(`Skipped (empty output): ${rel}`);
                    failed++;
                    continue;
                }

                const relOut = join(dirname(rel), basename(rel, extname(rel)) + '.xml');
                const outFilePath = join(outputPath, relOut);
                mkdirSync(dirname(outFilePath), { recursive: true });
                writeFileSync(outFilePath, result);

                if (type === 'auto')
                {
                    console.log(`Converted [auto → ${detectedType}]: ${rel} → ${relOut}`);
                }
                else
                {
                    console.log(`Converted: ${rel} → ${relOut}`);
                }
                converted++;
            }
            catch (err)
            {
                const msg = err instanceof Error ? err.message : String(err);
                console.error(`Failed: ${rel}: ${msg}`);
                failed++;
            }
        }

        // Copy non-markdown files (recursive mode only)
        for (const rel of otherFiles)
        {
            try
            {
                const destPath = join(outputPath, rel);
                mkdirSync(dirname(destPath), { recursive: true });
                copyFileSync(join(inputPath, rel), destPath);
                console.log(`Copied: ${rel}`);
                copied++;
            }
            catch (err)
            {
                const msg = err instanceof Error ? err.message : String(err);
                console.error(`Failed to copy: ${rel}: ${msg}`);
                failed++;
            }
        }

        console.log(`\nBatch complete: ${converted} converted, ${copied} copied, ${failed} failed.`);
        process.exit(failed > 0 ? 1 : 0);
    }

    // -------------------------------------------------------------------------
    // SINGLE FILE MODE
    // -------------------------------------------------------------------------
    else
    {
        if (recursive)
        {
            console.warn(`Warning: --recursive has no effect when --input is a file.`);
        }

        const type = typeRaw as string;

        // Auto-mode: warn and ask for confirmation
        if (type === 'auto')
        {
            console.warn(
                `\nWARNING: Auto-detect mode infers topic type from file content.` +
                `\n  tables → reference  |  top-level ordered lists → task  |  else → concept` +
                `\nResults may be inaccurate. Review output before use.` +
                `\n\nPress Enter to continue, or Ctrl+C to abort...`
            );
            await pressEnterToContinue();
        }

        const fileContents = readFileSync(inputPath, { encoding: 'utf8', flag: 'r' });
        const mdToDita = new MdDita({ flavor, htmlCleanup, verbose: true });

        const { result, detectedType } = await convertFile(mdToDita, fileContents, type as TopicTypeString | 'auto');

        const outputPath = (outputIndex !== -1 && args[outputIndex + 1] !== undefined)
            ? args[outputIndex + 1]
            : `output.xml`;

        writeFileSync(outputPath, result);

        if (type === 'auto')
        {
            console.log(`File converted as [${detectedType}] and saved to ${outputPath}`);
        }
        else
        {
            console.log(`File saved in ${outputPath}`);
        }
    }
};

main().catch((error) =>
{
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fatal error: ${message}`);
    process.exit(1);
});

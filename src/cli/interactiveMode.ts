import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve, normalize } from "path";
import { FlavorType, InteractiveManifest, TopicTypeString } from "../types";
import { detectTopicType } from "./autoDetect";

export const MANIFEST_FILENAME = 'md-dita-manifest.json';

/**
 * Attempts to load and parse the manifest file from the given output directory.
 * Returns null if the file does not exist or cannot be parsed.
 */
export function loadManifest(outputDir: string): InteractiveManifest | null
{
    const manifestPath = join(outputDir, MANIFEST_FILENAME);
    if (!existsSync(manifestPath)) return null;
    try
    {
        return JSON.parse(readFileSync(manifestPath, 'utf8')) as InteractiveManifest;
    }
    catch
    {
        return null;
    }
}

/**
 * Returns true if the manifest's inputDir matches the given inputDir,
 * indicating that Pass 2 (conversion) should proceed.
 */
export function isPass2(manifest: InteractiveManifest | null, inputDir: string): boolean
{
    if (!manifest) return false;
    return normalize(resolve(manifest.inputDir)) === normalize(resolve(inputDir));
}

/**
 * Pass 1: Auto-detect topic types for all discovered .md files, write the
 * manifest JSON to the output directory, and print instructions for the user.
 */
export function runInteractivePass1(
    inputDir: string,
    outputDir: string,
    mdFiles: string[],
    flavor: FlavorType,
    recursive: boolean
): void
{
    const files: Record<string, TopicTypeString> = {};

    for (const rel of mdFiles)
    {
        const content = readFileSync(join(inputDir, rel), 'utf8');
        const detected = detectTopicType(content);
        // Normalize to forward slashes for cross-platform JSON readability
        files[rel.replace(/\\/g, '/')] = detected;
    }

    const manifest: InteractiveManifest = {
        inputDir: resolve(inputDir),
        outputDir: resolve(outputDir),
        flavor,
        recursive,
        files,
    };

    const manifestPath = join(outputDir, MANIFEST_FILENAME);
    writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t'));

    console.log(`\nManifest written to: ${manifestPath}`);
    console.log(`\nReview and edit the "files" section to set the correct topic type for each file.`);
    console.log(`Valid types: concept, reference, task`);
    console.log(`\nThen re-run the same command to start conversion.`);
}

export enum TopicType {
  Concept = 1,
  Reference = 2,
  Task = 3,
}

export enum FlavorType {
  CommonMark = 'commonmark',
  GFM = 'gfm',
  MkDocs = 'mkdocs',
  Docusaurus = 'docusaurus',
}

export interface ConversionOptions {
  /** Markdown flavor/dialect. Controls which pre-processing transforms are applied. Default: CommonMark. */
  flavor?: FlavorType;
  /** Whether to convert embedded HTML (tables, notes/asides) to DITA equivalents. Default: true. */
  htmlCleanup?: boolean;
  /** Emit verbose log output. Default: false. */
  verbose?: boolean;
}

/** String union of valid DITA topic type names, used in manifests and auto-detection. */
export type TopicTypeString = 'concept' | 'reference' | 'task';

/** JSON manifest written by interactive mode Pass 1 and read by Pass 2. */
export interface InteractiveManifest {
  /** Absolute path to the input directory used when this manifest was generated. */
  inputDir: string;
  /** Absolute path to the output directory. */
  outputDir: string;
  /** Markdown flavor in use at generation time. The CLI --flavor flag always takes precedence on re-run. */
  flavor: FlavorType;
  /** Whether recursive scanning was active at generation time. */
  recursive: boolean;
  /**
   * Map of relative file paths (from inputDir) to topic type strings.
   * Keys always use forward-slash separators regardless of OS.
   */
  files: Record<string, TopicTypeString>;
}

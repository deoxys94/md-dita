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

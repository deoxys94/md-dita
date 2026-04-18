# md-dita

Convert Markdown to DITA XML. Supports **concept**, **reference**, and **task** topic types.

Built on [markdown-it](https://github.com/markdown-it/markdown-it) with custom renderer rules that emit DITA elements directly, followed by a [Cheerio](https://cheerio.js.org/)-based post-processing pass that resolves leftover HTML, cleans up structural quirks, and generates valid DITA output.

---

## Installation

```bash
git clone https://github.com/aldair-torres/md-dita.git
cd md-dita
bun install
```

---

## CLI Usage

The CLI is designed to run with [Bun](https://bun.sh/).

```bash
bun run src/main.ts --input <file> --type <concept|reference|task> [options]
```

Or, after building the project:

```bash
bun dist/main.js --input <file> --type <concept|reference|task> [options]
```

### Flags

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--input <file>` | Yes | — | Path to the Markdown file to convert |
| `--type <type>` | Yes | — | DITA topic type: `concept`, `reference`, or `task` |
| `--output <file>` | No | `output.xml` | Output path |
| `--flavor <flavor>` | No | `commonmark` | Markdown dialect: `commonmark`, `gfm`, `mkdocs`, `docusaurus` |
| `--no-html-cleanup` | No | — | Skip HTML table and note conversion |

### Examples

```bash
# CommonMark (default)
bun dist/main.js --input docs/overview.md --type concept --output overview.dita

# MkDocs source document
bun dist/main.js --input docs/guide.md --type reference --flavor mkdocs

# Docusaurus source, skip HTML cleanup
bun dist/main.js --input docs/task.md --type task --flavor docusaurus --no-html-cleanup
```

---

## Library Usage

Import `MdDita` from `md-dita` in your project. Bundle it with any bundler of your choice (Webpack, Vite, esbuild, etc.) for browser or Node environments.

```ts
import { MdDita, FlavorType } from 'md-dita';

// Default: CommonMark flavor, HTML cleanup enabled
const converter = new MdDita();

// MkDocs source document
const mkdocsConverter = new MdDita({ flavor: FlavorType.MkDocs });

// Verbose logging, skip HTML cleanup
const converter = new MdDita({ verbose: true, htmlCleanup: false });

const ditaXml = converter.mdToConcept(markdownString);
```

### Constructor Options

```ts
interface ConversionOptions {
  flavor?: FlavorType;     // default: FlavorType.CommonMark
  htmlCleanup?: boolean;   // default: true
  verbose?: boolean;       // default: false
}

enum FlavorType {
  CommonMark = 'commonmark',
  GFM        = 'gfm',
  MkDocs     = 'mkdocs',
  Docusaurus = 'docusaurus',
}
```

### API

```ts
class MdDita {
  constructor(options?: ConversionOptions)

  mdToConcept(markdown: string): string
  mdToReference(markdown: string): string
  mdToTask(markdown: string): string

  get getLogs(): string[]
}
```

| Method | Returns |
|--------|---------|
| `mdToConcept(md)` | DITA `<concept>` XML string, or `""` on failure |
| `mdToReference(md)` | DITA `<reference>` XML string, or `""` on failure |
| `mdToTask(md)` | DITA `<task>` XML string, or `""` on failure |
| `getLogs` | Array of warning/error messages from the last conversion |

---

## Flavors

The `--flavor` flag (CLI) / `flavor` option (API) controls which dialect-specific pre-processing transforms are applied.

| Transform | CommonMark | GFM | MkDocs | Docusaurus |
|-----------|:---:|:---:|:---:|:---:|
| `??? "Title"` collapsibles → `##` | — | — | ✓ | — |
| `--8<-- "file.md"` conrefs → `<draft-comment>` | — | — | ✓ | — |
| `{: style="..."}` attribute stripping | — | — | ✓ | — |
| `:::note` admonitions → `<note>` | — | — | — | ✓ |
| `{:? .note}` / `{:? .tip}` / `{:? .warning}` → `<note>` | — | — | ✓ | — |
| `<aside type="...">` → `<note>` | ✓ | ✓ | ✓ | ✓ |
| `**Footnotes:**` header removal | ✓ | ✓ | ✓ | ✓ |

**CommonMark** is the default. It processes standard Markdown without any dialect-specific syntax.

**GFM** (GitHub Flavored Markdown) uses the same pre-processing as CommonMark. GFM-specific features like pipe tables and strikethrough are handled natively by markdown-it.

**MkDocs** enables all MkDocs-specific transforms. Use this for documents previously written for MkDocs sites that use embedded HTML, admonitions, or snippet includes.

**Docusaurus** converts `:::note`/`:::tip`/`:::warning`/`:::danger`/`:::caution` admonition blocks to DITA `<note>` elements.

---

## How It Works

Each conversion runs through three phases:

### Phase 1: Pre-processing

Applied to the raw Markdown string before parsing. Which transforms run depends on the active flavor (see [Flavors](#flavors) above). Universal transforms (all flavors):

- **Footnote header removal**: Strips `**Footnotes:**` section headers.
- **Heading spacing normalization**: Ensures `## ` headings are preceded by a blank line.

### Phase 2: Rendering (markdown-it)

A topic-type-specific renderer subclass converts markdown tokens into DITA XML. Common element mappings:

| Markdown | DITA |
|----------|------|
| `# Heading` | `<concept>`, `<reference>`, or `<task>` root + `<title>` |
| `## Heading` | `<section><title>` (concept/reference) or `<title>` (task) |
| paragraph | `<p>` |
| `> blockquote` | `<lq>` |
| `` `inline code` `` | `<codeph>` |
| ` ```fenced block``` ` | `<codeblock>` |
| `*italic*` | `<cite>` |
| `**bold**` | `<strong>` (resolved later) |
| `[link](url)` | `<xref href="url">` |
| `![img](url)` | `<image placement="break" href="url" alt="..."/>` |
| ordered list (task) | `<steps>` / `<step>` |

### Phase 3: Post-processing (Cheerio)

A series of Cheerio passes clean up and finalize the XML:

- **Menu cascades**: `**File > New > Project**` becomes `<menucascade><uicontrol>` elements.
- **HTML tables** *(requires `htmlCleanup: true`)*: `<table>` elements are fully converted to DITA `<table>/<tgroup>/<colspec>/<thead>/<tbody>/<entry>` structure. Merged cells (colspan/rowspan) are expanded.
- **Notes** *(requires `htmlCleanup: true`)*: Dialect-specific note markers and `<aside type="...">` elements become `<note>` elements with the appropriate `type` attribute.
- **Concept/Reference fixup**: Orphaned content between sections is moved into the correct `<section>`, and topic IDs are generated from the title.
- **Task fixup**: Structures `<context>`, `<steps>`, `<step>`, `<cmd>`, `<info>`, and `<result>` from the raw list output. Multiple H2 headers produce nested `<task>` subtopics.
- **Final cleanup**: Remaining `<strong>` → `<uicontrol>`, `<a>` → `<xref>`, internal link rewriting to `#topicid/anchor`, external xref attributes (`format="html" scope="external"`), anchor ID extraction from `{#id}` syntax in titles.

---

## Supported DITA Elements

### Concept & Reference

`<concept>` / `<reference>` · `<conbody>` / `<refbody>` · `<section>` · `<title>` · `<p>` · `<lq>` · `<codeblock>` · `<codeph>` · `<cite>` · `<uicontrol>` · `<menucascade>` · `<xref>` · `<image>` · `<note>` · `<table>` · `<ul>` · `<ol>` · `<li>`

### Task

All of the above, plus: `<task>` · `<taskbody>` · `<context>` · `<steps>` · `<step>` · `<cmd>` · `<info>` · `<result>`

---

## Special Syntax

| Syntax | Flavor | Result |
|--------|--------|--------|
| `??? "Title"` | MkDocs | Converted to `## Title` before parsing |
| `--8<-- "file.md"` | MkDocs | Becomes `<draft-comment>` placeholder |
| `{:? .note}` / `{:? .tip}` / `{:? .warning}` | MkDocs | Becomes `<note>` / `<note type="tip">` / `<note type="warning">` |
| `:::note` / `:::tip` / `:::warning` | Docusaurus | Becomes `<note>` / `<note type="tip">` / `<note type="warning">` |
| `:::danger` / `:::caution` | Docusaurus | Becomes `<note type="danger">` / `<note type="caution">` |
| `**Menu > Item**` | All | Becomes `<menucascade><uicontrol>Menu</uicontrol><uicontrol>Item</uicontrol></menucascade>` |
| `{#anchor-id}` in headings | All | Sets `id` attribute on the parent element |

---

## Building

Requires TypeScript:

```bash
bun install
bun run build
```

Output goes to `dist/`. The CLI entry point is `dist/main.js`; the library entry point is `dist/md-dita.js`.

---

## Testing

```bash
npm test            # run once
npm run test:watch  # watch mode
```

Tests use [Vitest](https://vitest.dev/) and cover concept, reference, and task conversion.

---

## License

MIT © Aldair Torres

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
bun run src/main.ts --input <file> --type <concept|reference|task> [--output <file>]
```

Or, after building the project:

```bash
bun dist/main.js --input <file> --type <concept|reference|task> [--output <file>]
```

### Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--input <file>` | Yes | Path to the Markdown file to convert |
| `--type <type>` | Yes | DITA topic type: `concept`, `reference`, or `task` |
| `--output <file>` | No | Output path (defaults to `output.xml`) |

### Example

```bash
bun dist/main.js --input docs/overview.md --type concept --output overview.dita
```

---

## Library Usage

Import `MdDita` from `md-dita` in your project. Bundle it with any bundler of your choice (Webpack, Vite, esbuild, etc.) for browser or Node environments.

```ts
import { MdDita } from 'md-dita';

const converter = new MdDita(false); // pass true for verbose logging

const ditaXml = converter.mdToConcept(markdownString);
```

### API

```ts
class MdDita {
  constructor(verbose: boolean)

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

## How It Works

Each conversion runs through two phases:

### Phase 1: Pre-processing

Applied to the raw Markdown string before parsing:

- **Collapsible elements**: `??? "Section Title"` syntax (MkDocs-style collapsible sections) is converted to `## Section Title` headers.
- **Conrefs**: `--8<-- "file.md"` Given that each project might be structured differently, snippets are replaced with `<draft-comment>` placeholders indicating where content should be included.
- **Misc cleanup**: Removes `**Footnotes:**` section headers, strips `{: style="..."}` inline attributes.

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
- **HTML tables**: `<table>` elements are fully converted to DITA `<table>/<tgroup>/<colspec>/<thead>/<tbody>/<entry>` structure. Merged cells (colspan/rowspan) are expanded.
- **Notes**: `{:? .note}`, `{:? .tip}`, `{:? .warning}` markers and `<aside type="...">` elements become `<note>` elements with the appropriate `type` attribute.
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

| Syntax | Result |
|--------|--------|
| `??? "Title"` | Converted to `## Title` before parsing |
| `--8<-- "file.md"` | Becomes `<draft-comment>` placeholder |
| `{:? .note}` / `{:? .tip}` / `{:? .warning}` | Becomes `<note>` / `<note type="tip">` / `<note type="warning">` |
| `**Menu > Item**` | Becomes `<menucascade><uicontrol>Menu</uicontrol><uicontrol>Item</uicontrol></menucascade>` |
| `{#anchor-id}` in headings | Sets `id` attribute on the parent element |

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
npm test          # run once
npm run test:watch  # watch mode
```

Tests use [Vitest](https://vitest.dev/) and cover concept, reference, and task conversion.

---

## License

MIT © Aldair Torres

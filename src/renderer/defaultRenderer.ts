import markdownit from "markdown-it";

export abstract class BaseDitaRenderer
{
  protected md = new markdownit({
    html: true,
  });

  constructor() 
  {
    this.md.renderer.rules.blockquote_open = (tokens, idx) =>
    {
      tokens[idx].tag = "lq";
      return this.md.renderer.renderToken(tokens, idx, {});
    };

    this.md.renderer.rules.blockquote_close = (tokens, idx) =>
    {
      tokens[idx].tag = "lq";
      return this.md.renderer.renderToken(tokens, idx, {});
    };

    this.md.renderer.rules.code_block = (tokens, idx) =>
      `<codeblock>${this.md.utils.escapeHtml(tokens[idx].content)}</codeblock>`;

    this.md.renderer.rules.code_inline = (tokens, idx) =>
      `<codeph>${this.md.utils.escapeHtml(tokens[idx].content)}</codeph>`;

    this.md.renderer.rules.strong_open = () => "<strong>";

    this.md.renderer.rules.strong_close = () => "</strong>";

    this.md.renderer.rules.em_open = () => "<cite>";

    this.md.renderer.rules.em_close = () => "</cite>";

    this.md.renderer.rules.link_open = (tokens, idx) =>
    {
      const hrefIndex = tokens[idx].attrIndex("href");
      const hrefAttr = tokens[idx].attrs?.[hrefIndex];
      const hrefValue = hrefAttr?.[1];
      return `<xref href="${hrefValue}">`;
    };

    this.md.renderer.rules.link_close = () => "</xref>";

    this.md.renderer.rules.image = (tokens, idx) =>
    {
      const srcIndex = tokens[idx].attrIndex("src");
      const srcAttr = tokens[idx].attrs?.[srcIndex];
      const srcValue = srcAttr?.[1];
      const altIndex = tokens[idx].attrIndex("alt");
      const altAttr = tokens[idx].attrs?.[altIndex];
      const altValue = altAttr?.[1];

      return `<image placement="break" href="${srcValue}" alt="${altValue}"/>`;
    };

    this.md.renderer.rules.hardbreak = () => "\n";

    this.md.renderer.rules.softbreak = () => "\n";

    this.md.renderer.rules.del_open = () => "";

    this.md.renderer.rules.del_close = () => "";

    this.md.renderer.rules.s_open = () => "";

    this.md.renderer.rules.s_close = () => "";

    this.md.renderer.rules.fence = (tokens, idx) =>
      `<codeblock>${this.md.utils.escapeHtml(tokens[idx].content.trim())}</codeblock>`;
  }
}

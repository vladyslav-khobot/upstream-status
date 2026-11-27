const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeEntities = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    }
    if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });

const stripTags = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '');

/**
 * Incident updates on status pages contain a little HTML (mostly <br /> and links).
 * We turn it into plain text so clients never have to render upstream markup.
 *
 * Tags are stripped twice because some pages (e.g. Twilio) send HTML that was
 * escaped twice: `&#60;p&#62;` only becomes a tag after the first decode.
 */
export const htmlToText = (html: string): string =>
  stripTags(decodeEntities(stripTags(html)))
    .replace(/\n{3,}/g, '\n\n')
    .trim();

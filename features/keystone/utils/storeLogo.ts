// Server-boundary SVG sanitizer. Client and onboarding modules must import
// only the pure constants/normalizer from platform/store-settings/lib.
const ALLOWED_ELEMENTS = new Set([
  'svg',
  'g',
  'path',
  'defs',
  'lineargradient',
  'radialgradient',
  'stop',
  'clippath',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'title',
  'desc',
]);

const ALLOWED_ATTRIBUTES = new Set([
  'xmlns',
  'fill',
  'fill-rule',
  'clip-rule',
  'height',
  'width',
  'viewbox',
  'd',
  'clip-path',
  'id',
  'x1',
  'x2',
  'y1',
  'y2',
  'gradientunits',
  'gradienttransform',
  'offset',
  'stop-color',
  'stop-opacity',
  'opacity',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'transform',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'points',
  'role',
  'aria-hidden',
  'aria-label',
  'preserveaspectratio',
]);

const ATTRIBUTE_PATTERN = /\s+([A-Za-z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*')/g;
const TAG_PATTERN = /<\/?\s*([A-Za-z][\w:-]*)([^<>]*)>/g;

export function sanitizeStoreLogoSvg(svg: string): string {
  const source = svg.trim();
  if (!source.startsWith('<svg') || !source.endsWith('</svg>') || source.length > 100_000) {
    return '';
  }
  if (/<!|<\?|\b(?:javascript|data|vbscript):|\bon[a-z]+\s*=|\b(?:href|src|style)\s*=/i.test(source)) {
    return '';
  }

  let tagCount = 0;
  let match: RegExpExecArray | null;
  TAG_PATTERN.lastIndex = 0;
  while ((match = TAG_PATTERN.exec(source))) {
    tagCount += 1;
    const element = match[1].toLowerCase();
    if (!ALLOWED_ELEMENTS.has(element)) return '';
    if (match[0].startsWith('</')) continue;

    const attributes = match[2];
    let consumed = '';
    ATTRIBUTE_PATTERN.lastIndex = 0;
    let attributeMatch: RegExpExecArray | null;
    while ((attributeMatch = ATTRIBUTE_PATTERN.exec(attributes))) {
      consumed += attributeMatch[0];
      const attribute = attributeMatch[1].toLowerCase();
      const value = attributeMatch[2].slice(1, -1);
      if (!ALLOWED_ATTRIBUTES.has(attribute)) return '';
      if (attribute === 'id' && !/^[A-Za-z_][\w:.-]*$/.test(value)) return '';
      if (/url\(/i.test(value) && !/^url\(#[A-Za-z_][\w:.-]*\)$/.test(value)) return '';
    }

    const remainder = attributes.replace(consumed, '').replace(/\//g, '').trim();
    if (remainder) return '';
  }

  TAG_PATTERN.lastIndex = 0;
  if (tagCount === 0 || source.replace(TAG_PATTERN, '').trim()) return '';
  return source;
}

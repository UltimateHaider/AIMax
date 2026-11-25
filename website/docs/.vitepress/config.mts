import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitepress';
import markdownItKatex from 'markdown-it-katex';
import sidebar from './sidebar';

type SidebarItem = { text: string; link: string };

const SITE_URL = (process.env.SITE_URL || 'https://aiengineeringfromscratch.com').replace(/\/+$/, '');
const SITE_NAME = 'هندسة الذكاء الاصطناعي من الصفر';
const DEFAULT_DESCRIPTION =
  'المسار التعليمي التطبيقي الشامل من الصفر إلى الاحتراف في هندسة الذكاء الاصطناعي (435 درساً عبر 20 مرحلة).';
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const isLessonPath = (path: string): boolean => /^\/phases\/\d{2}\/[^/]+$/.test(path);

function canonicalPath(relativePath: string): string {
  const value = relativePath.replace(/\\/g, '/');
  if (value === 'index.md') return '/';
  if (value.endsWith('/index.md')) return '/' + value.slice(0, -'index.md'.length);
  return '/' + value.replace(/\.md$/, '');
}

function truncateDescription(value: string, limit: number): string {
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit);
  const space = cut.lastIndexOf(' ');
  const trimmed = (space > limit * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.،؛]+$/u, '');
  return `${trimmed}…`;
}

function escapeMeta(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripMarkdownInline(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * VitePress only infers a description from frontmatter. Lessons do not
 * carry one, so use the first meaningful prose paragraph (max ~158 chars)
 * after removing headings, code, images, tables and math.
 */
function extractDescription(raw: string): string {
  let body = raw.replace(/\r\n?/g, '\n').replace(/^---[\s\S]*?---\s*/, '');
  body = body
    .replace(/```[\s\S]*?```/g, '\n\n')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ');

  for (const block of body.split(/\n{2,}/)) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^#{1,6}\s/.test(trimmed)) continue;
    if (/^([-*_]\s*){3,}$/.test(trimmed)) continue;
    if (/^\|/.test(trimmed)) continue;

    const text = stripMarkdownInline(trimmed);
    if (text.length < 40) continue;
    if (/^(type|languages|prerequisites|time)\s*:/i.test(text)) continue;
    return truncateDescription(text, 158);
  }

  return '';
}

// Flat list of all lessons (used to keep cross-phase prev/next links working
// while the custom sidebar renders the full navigation).
const allLessons: SidebarItem[] = Object.values(
  sidebar as Record<string, { items?: SidebarItem[] }[]>
).flatMap((sections) => sections.flatMap((section) => section.items ?? []));

// VitePress only needs a non-empty sidebar shell so its layout, mobile drawer
// and local nav appear. CustomSidebar.vue renders the real 20-phase navigation
// from sidebar.ts. Keeping the shell empty avoids duplicating 435 links in HTML.
const sidebarShell = {
  '/phases/': [{ text: 'المسار التعليمي', collapsed: true, items: [] }]
};

function escapeSearchText(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char
  );
}

/**
 * Keep multiplication asterisks in plain-text formulas from being parsed as
 * Markdown emphasis (e.g. `3*1` becoming `31`). Only a single `*` between
 * identifier/number characters is consumed; normal *italic* and **bold**
 * markers still reach the emphasis rule.
 */
function mathMultiplication(state: any, silent: boolean): boolean {
  const pos = state.pos;
  if (state.src.charCodeAt(pos) !== 0x2a) return false;

  const prev = state.src.charCodeAt(pos - 1);
  const next = state.src.charCodeAt(pos + 1);
  const isIdentifier = (code: number): boolean =>
    (code >= 0x30 && code <= 0x39) ||
    (code >= 0x41 && code <= 0x5a) ||
    (code >= 0x61 && code <= 0x7a) ||
    code === 0x5f;
  const isPrev = isIdentifier(prev) || prev === 0x29 || prev === 0x5d || prev === 0x7d;
  const isNext = isIdentifier(next) || next === 0x28 || next === 0x5b || next === 0x7b;

  if (!isPrev || !isNext) return false;

  if (!silent) state.pending += '*';
  state.pos += 1;
  return true;
}

export default defineConfig({
  lang: 'ar',
  dir: 'rtl',
  title: 'هندسة الذكاء الاصطناعي من الصفر',
  titleTemplate: ':title | هندسة الذكاء الاصطناعي',
  description: 'المسار التعليمي التطبيقي الشامل من الصفر إلى الاحتراف في هندسة الذكاء الاصطناعي (435 درساً عبر 20 مرحلة).',
  cleanUrls: true,
  metaChunk: true,
  buildConcurrency: 4,

  vite: {
    build: {
      reportCompressedSize: false,
    },
  },

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    config: (md: any) => {
      md.use(markdownItKatex, {
        throwOnError: false,
        errorColor: '#cc0000',
        strict: false,
      });
      // The corpus uses "$" for currency and pricing units (e.g. $50,000,
      // $/M tokens, $input, A$AP Rocky). Inline `$...$` math is therefore
      // disabled entirely; display `$$...$$` math (math_block) stays enabled
      // for future lessons.
      md.inline.ruler.disable('math_inline');
      md.inline.ruler.before('emphasis', 'math_multiplication', mathMultiplication);

      // Lesson images sit well below the fold; defer them without changing
      // the author-provided alt text (all 80 lesson images already have one).
      const defaultImageRenderer = md.renderer.rules.image;
      md.renderer.rules.image = (tokens: any[], idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        token.attrSet('loading', 'lazy');
        token.attrSet('decoding', 'async');
        return defaultImageRenderer
          ? defaultImageRenderer(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      };
    },
  },

  transformPageData(pageData) {
    const relativePath = pageData.relativePath.replace(/\\/g, '/');
    const pagePath = canonicalPath(relativePath);

    if (pagePath !== '/404' && !pageData.description) {
      let description = '';
      try {
        description = extractDescription(
          readFileSync(new URL(`../${pageData.filePath}`, import.meta.url), 'utf8')
        );
      } catch {
        // Fall back to a generated Arabic description below.
      }

      if (!description) {
        const titleAr = String(pageData.frontmatter.titleAr || pageData.title || '').trim();
        const phaseAr = String(pageData.frontmatter.phaseAr || '').trim();
        description = phaseAr
          ? `درس «${titleAr}» ضمن ${phaseAr} في مسار هندسة الذكاء الاصطناعي من الصفر.`
          : `صفحة ${titleAr} ضمن مسار هندسة الذكاء الاصطناعي من الصفر.`;
      }

      pageData.description = description;
      pageData.frontmatter.description = description;
    }

    // Include the phase in every lesson title so duplicated lesson names
    // (e.g. two "Vision Transformers (ViT)" lessons) stay unique.
    if (isLessonPath(pagePath)) {
      const phaseAr = String(pageData.frontmatter.phaseAr || '').trim();
      if (phaseAr) {
        pageData.titleTemplate = `:title — ${phaseAr} | هندسة الذكاء الاصطناعي`;
      }
    }

    const index = allLessons.findIndex((lesson) => lesson.link === pagePath);
    if (index === -1) return;

    if (index > 0) pageData.frontmatter.prev = allLessons[index - 1];
    if (index < allLessons.length - 1) pageData.frontmatter.next = allLessons[index + 1];
  },

  transformHead({ pageData }) {
    const relativePath = pageData.relativePath.replace(/\\/g, '/');
    const pagePath = canonicalPath(relativePath);

    if (pagePath === '/404') {
      return [['meta', { name: 'robots', content: 'noindex, follow' }]];
    }

    const url = `${SITE_URL}${pagePath}`;
    const description = pageData.description || DEFAULT_DESCRIPTION;
    const pageTitle = pageData.title || SITE_NAME;
    const safeDescription = escapeMeta(description);
    const safeTitle = escapeMeta(pageTitle);
    const type = isLessonPath(pagePath) ? 'article' : 'website';

    const tags: [string, Record<string, string>][] = [
      ['meta', { name: 'description', content: safeDescription }],
      ['link', { rel: 'canonical', href: url }],
      ['link', { rel: 'alternate', hreflang: 'ar', href: url }],
      ['link', { rel: 'alternate', hreflang: 'x-default', href: url }],
      [
        'meta',
        {
          name: 'robots',
          content: 'index, follow, max-image-preview:large, max-snippet:-1'
        }
      ],
      ['meta', { property: 'og:site_name', content: SITE_NAME }],
      ['meta', { property: 'og:locale', content: 'ar_AR' }],
      ['meta', { property: 'og:type', content: type }],
      ['meta', { property: 'og:title', content: safeTitle }],
      ['meta', { property: 'og:description', content: safeDescription }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: OG_IMAGE }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:image:alt', content: escapeMeta(`${SITE_NAME} — ${pageTitle}`) }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: safeTitle }],
      ['meta', { name: 'twitter:description', content: safeDescription }],
      ['meta', { name: 'twitter:image', content: OG_IMAGE }]
    ];

    if (isLessonPath(pagePath)) {
      const phaseAr = String(pageData.frontmatter.phaseAr || '').trim();
      if (phaseAr) tags.push(['meta', { property: 'article:section', content: escapeMeta(phaseAr) }]);
    }

    return tags;
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'sitemap', type: 'application/xml', title: 'Sitemap', href: '/sitemap.xml' }],
    [
      'link',
      {
        rel: 'preload',
        href: '/fonts/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6Ys43PWrfQ.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: ''
      }
    ],
    [
      'link',
      {
        rel: 'preload',
        href: '/fonts/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOG-eCRXMR5Kw.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: ''
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: '/fonts/fonts.css'
      }
    ],
    ['meta', { name: 'theme-color', content: '#3553ff' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
  ],

  themeConfig: {
    siteTitle: 'هندسة الذكاء الاصطناعي',
    
    nav: [
      { text: 'الرئيسية', link: '/' },
      { text: 'خريطة المسار (20 مرحلة)', link: '/roadmap' },
      { text: 'عن المسار', link: '/about' },
      { 
        text: 'المستودع الأصلي', 
        link: 'https://github.com/UltimateHaider/ai-engineering-from-scratch' 
      }
    ],

    sidebar: sidebarShell,

    search: {
      provider: 'local',
      options: {
        detailedView: true,
        _render(src, env, md) {
          // `env.frontmatter` is not populated before md.render() runs, so
          // read the raw frontmatter to honour `search: false`.
          const rawFrontmatter = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
          if (/^search:\s*false\s*$/m.test(rawFrontmatter)) return '';
          // Strip large code blocks and math blocks to keep index fast and lightweight
          const stripped = src.replace(/```[\s\S]*?```/g, '').replace(/\$\$[\s\S]*?\$\$/g, '');
          const html = md.render(stripped, env);
          const arabicTerms = [
            escapeSearchText(env?.frontmatter?.titleAr),
            escapeSearchText(env?.frontmatter?.phaseAr)
          ].filter(Boolean);
          return arabicTerms.length ? `${html}<p>${arabicTerms.join(' — ')}</p>` : html;
        },
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'بحث في الدروس...',
                buttonAriaLabel: 'بحث في الدروس'
              },
              modal: {
                displayDetails: 'عرض التفاصيل',
                resetButtonTitle: 'إعادة ضبط البحث',
                backButtonTitle: 'إغلاق البحث',
                noResultsText: 'لا توجد نتائج مطابقة لـ',
                footer: {
                  selectText: 'للاختيار',
                  navigateText: 'للتنقل',
                  closeText: 'للإغلاق'
                }
              }
            }
          }
        }
      }
    },

    docFooter: {
      prev: 'الدرس السابق',
      next: 'الدرس التالي'
    },

    outline: {
      label: 'محتويات الدرس',
      level: [2, 3]
    },

    darkModeSwitchLabel: 'المظهر',
    returnToTopLabel: 'العودة للأعلى',
    sidebarMenuLabel: 'القائمة',

    footer: {
      message: 'مبني على مستودع UltimateHaider/ai-engineering-from-scratch تحت ترخيص MIT.',
      copyright: 'حقوق النشر © 2026 هندسة الذكاء الاصطناعي من الصفر.'
    }
  }
});

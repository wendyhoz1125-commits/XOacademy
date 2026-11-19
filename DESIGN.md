# XO Academy: design system

Help center for XO Scheduler. The visual language follows xoscheduler.com (warm white, graphite, sage,
Wix Madefor type, pill controls) with a more technical, colourful layer for navigation: one soft gradient per
category. The approved design lives in the Claude Design canvas "XO Academy Help Center".

## Colour

Every value is a token in `src/index.css`. Ratios were calculated against the background they are used on.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--background` | `#FDFAFA` | Page (the website's warm white) | |
| `--foreground` | `#2D3431` | Text, headings | 12.3:1 |
| `--primary` | `#2D3431` | Primary buttons, footer, active chips | White text 12.7:1 |
| `--brand` | `#2F5D53` | Links, kickers, accents | 7.2:1 on page |
| `--muted-foreground` | `#5E6763` | Secondary text | 5.6:1 on page |
| `--accent` | `#E1EEE8` | Callouts, video tag | Brand text 6.3:1 |
| `--border` | `#DDE1DF` | Dividers (decorative) | |
| `--input` | `#7A8480` | Control borders | 3.9:1 (meets 1.4.11) |
| `--hero` | `#232A27` + sage glow | Home banner | White 14.7:1 |
| `--hero-accent` | `#A9D3C3` | Kicker and links on the banner | 8.9:1 |
| `--hero-muted` | `#D5DDD9` | Body text on the banner | 10.6:1 |

Light theme only. `@custom-variant dark` keeps shadcn's `dark:` styles from following the OS setting.

## Category artwork

Each category has a gradient and a line icon (`categoryArt` in `src/lib/content.ts`), used on home cards, the
mobile list, the category header and search results. Text over a gradient sits on a white fade at the bottom.

| Category | Gradient | Icon |
|---|---|---|
| Understanding the big picture | Lilac to aqua | Compass |
| Get ready and prepare to schedule | Coral, orange, mint | Clipboard with check |
| Scheduling | Sand to lime | Calendar |
| Dailies | Gold and bright green | Clock |
| Settings and environment | Lavender to green | Sliders |
| Frequently Asked Questions | Peach and sage | Question mark |
| Tips and tricks (not public yet) | Peach, gold, light green | Light bulb |

## Typography

Wix Madefor, as on xoscheduler.com. Display for headings (weight 400, tight tracking), Text for everything else.

| Role | Mobile | From 768 px |
|---|---|---|
| Home title | 36/42 | 60/64 |
| Page title | 30/36 | 44/50 |
| Section | 24/32 | 32/40 |
| Body, article | 16/28 | 17/30 |
| Kicker (uppercase) | 12/16, 600 | 12/16, 600 |

## Shape and touch

- **Controls:** pill-shaped (search fields, buttons, chips, pagination), 44 px minimum height everywhere.
- **Surfaces:** 16 to 20 px radius, white on the warm page, 1 px border. Shadows only on floating layers.
- **Focus:** 2 px brand outline (mint on dark surfaces), never hidden by the sticky header.

## Layout

| Width | Change |
|---|---|
| Base | One column. Sections as a compact list. Menu and log in inside the sheet |
| 640 px | Log in button in the header. Sections as cards |
| 768 px | Search field in the header |
| 1024 px | Left navigation on category and article pages. Menu button hidden |

## Components

- **shadcn/ui** (`src/components/ui`): Button, Input, Breadcrumb, Accordion (heading level configurable), Sheet.
- **SearchBox:** popular and recent searches on focus, live results with highlighted terms while typing,
  arrow-key navigation, Escape to close.
- **Search page:** search-engine style results with category filters, 10 per page, and sitelinks on the top result.
- **CategoryArticleNav:** the current category's topics, collapsible, with the current article marked.

## Open items

- **Support address:** the live link goes to `support@example.com`. Set `SUPPORT_EMAIL` in
  `src/components/shared.tsx` and the button appears.
- **Seventh section:** "Tips and tricks to make life smoother" is not in the public API yet. Its artwork is ready
  and it appears automatically when published.
- **Bundle size:** the prototype embeds a content snapshot (`src/data/content.json`, refreshed with
  `node scripts/fetch-content.mjs`). In production, read from the help center API instead.
- **Images:** article images have empty alt text in the CMS.

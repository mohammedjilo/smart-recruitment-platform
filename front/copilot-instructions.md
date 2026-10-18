# Color rules (React + MUI + Tailwind v4)

Colors come ONLY from tokens in src/theme/tokens.ts. Never write hex/rgb or default
Tailwind palette colors (blue-_, gray-_, slate-_, purple-_, violet-_, indigo-_).

## Tokens

Tailwind: bg-bg, bg-surface, border-border, text-content, text-muted, bg-primary,
text-primary, hover:bg-primary-dark, bg-primary-tint. MUI: 'background.default',
'background.paper', 'divider', 'text.primary', 'text.secondary', 'primary.main',
'primary.dark', 'primary.light'. Follow each file's existing style (className files use
Tailwind tokens, sx files use MUI theme values). Never mix both on one element.

## Decide by the ROLE of the element, not by its old color

1. Informational text (titles, names, dates, locations, descriptions, table cell content):
   NEVER primary. Main text = default color / text-content. Secondary text = text-muted /
   color="textSecondary".
2. Interactive elements (buttons, links, active nav item, selected row/tab, focus ring,
   switch, checkbox, progress): primary. Hover = primary-dark.
3. Highlight chips/badges/soft panels: bg-primary-tint + text-primary.
4. Icons: next to info text = muted; interactive = primary.
5. Cards/panels/dialogs = bg-surface + border-border. Page = bg-bg. Old
   purple/violet/indigo does NOT automatically mean primary.

## Never change

red/green/amber/yellow/orange for error/success/warning/pending/deadline; status colors
(status.ts, statusStyles.ts); employment-type and notification category colors;
match-score; charts; shadows/rgba/scrims; disabled states. Do not create new tokens. Do
not edit tokens.ts, AppThemeProvider.tsx, index.css.

## Workflow

Edit only the files I list. Keep layout and logic unchanged. Before editing, output a
table: file:line | element | role (info/interactive/highlight) | old → new. List ambiguous
items instead of guessing. Run type-check at the end.

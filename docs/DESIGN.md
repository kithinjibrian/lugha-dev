# Design — lugha-dev

The site's look is **Machweo** (core decision 4). Every colour, font and size in `services/ui-web/` comes from this file. The clickable prototype is https://claude.ai/artifact/M6vsrSiDskXzH4sFSQkD3n.

## Ideas

- **The horizon** is the main structural element: a thin line that carries progress and separates sections, where other sites use cards.
- **The sun** means "you are here" and "this is the main action": course position, Run, Start learning, the active tab. It is the only bright thing on a page.
- **The baobab** waits at the end of the course's horizon. When the course is done, the sun sits behind it and makes the logo.
- **Code is the ground:** code panels are the darkest surfaces.

## Colour (dark only in v1)

| Token | Value | Used for |
|---|---|---|
| `night` | `#14110F` | page background |
| `bar` | `#1A1613` | header and toolbars |
| `raised` | `#241F1B` | selected file, quiet buttons |
| `line` | `#2A241F` | borders between areas |
| `line-strong` | `#3A3129` | button outlines, the horizon not yet walked |
| `ground` | `#0C0A09` | code panels, output |
| `editor` | `#17130F` | the editor's background |
| `sand` | `#F3E9DA` | main text |
| `sand-2` | `#D6C9B6` | secondary text |
| `dust` | `#A99C8A` | labels, inactive links |
| `faint` | `#5E544A` | lines and marks, never text: it is under 4.5:1 on every background (line numbers and hints use `dust`) |
| `sun` | `#FF7400` | primary buttons (with `night` text), the horizon walked |
| `gold` | `#E8C400` | the sun gradient's end, program output |
| `link` | `#FFB066` | links, the active nav item |
| `error` | `#FF8A80` | errors, wrong answers |
| `tree` | `#121212` | the baobab in the logo, and on the horizon when the course is done |
| `tree-far` | `#7A6C5E` | the baobab on the horizon before the course is done |

The sun is always the gradient `#FF7400` → `#E8C400`, top to bottom.

## Code colours

| Token | Value |
|---|---|
| keyword | `#FF8A2A` |
| type | `#8CC8F2` |
| literal | `#F0D040` |
| comment | `#8A7E70` |
| text | `#F3E9DA` |
| changed line | `#3A2410` background, a 3 px `sun` bar |
| error line | `#3A1C18` background |

## Type

- **Bricolage Grotesque** (400, 600, 800): headings, buttons, interface text. Headings at 800 with tight letter-spacing.
- **Source Serif 4** (400, 600, italic): lesson and example prose, 17–19 px, line height 1.65.
- **JetBrains Mono** (400, 700): all code, 15–17 px.

## Shapes

- Primary buttons are pills (`border-radius: 999px`), at least 44 px tall.
- Code panels: 16–28 px corners; a hero card rounds all corners.
- Touch targets are at least 44 px; text meets 4.5:1 contrast.

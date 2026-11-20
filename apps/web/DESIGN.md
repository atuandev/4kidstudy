---
name: 4KidStudy
description: English for Vietnamese children in grades 1–5, built as chunky, tactile play.
colors:
  leaf-green: "#22C55E"
  leaf-green-deep: "#16A34A"
  forest-green: "#15803D"
  leaf-wash: "#DCFCE7"
  sky-blue: "#1CB0F6"
  sky-blue-deep: "#0284C7"
  sky-ink: "#0369A1"
  sky-wash: "#E0F2FE"
  sunshine-yellow: "#FFC800"
  sun-deep: "#B78A00"
  sun-ink: "#7A4A00"
  sun-body: "#4A3A10"
  sun-wash: "#FEF3C7"
  cherry-red: "#FF4B4B"
  cherry-red-deep: "#BE123C"
  cherry-wash: "#FFE4E6"
  grape-purple: "#A855F7"
  grape-ink: "#7E22CE"
  grape-wash: "#F3E8FF"
  tangerine-orange: "#FF9600"
  lagoon-teal: "#14B8A6"
  bubblegum-pink: "#F472B6"
  slate-ink: "#3D465D"
  slate-body: "#475569"
  slate-meta: "#64748B"
  slate-edge: "#E2E8F0"
  slate-wash: "#F1F5F9"
  lime-ground: "#E9F9DF"
  lime-rule: "#D3EEC2"
  mint-on-forest: "#DCFCE7"
  paper-white: "#FFFFFF"
typography:
  display:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 900
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  page-title:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.4
  echo:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.5
  body:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  button: "8.4px"
  field: "12px"
  chip: "16px"
  tile: "18px"
  nav: "20px"
  card: "22px"
  sticker: "26px"
  panel: "28px"
  sheet: "32px"
  pill: "9999px"
spacing:
  gutter: "16px"
  gutter-wide: "32px"
  stack: "20px"
  section: "80px"
  section-wide: "112px"
  container: "1200px"
  sidebar: "256px"
components:
  button-go:
    backgroundColor: "{colors.leaf-green-deep}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "8px 16px"
  button-go-hover:
    backgroundColor: "{colors.forest-green}"
  button-go-hero:
    backgroundColor: "{colors.leaf-green-deep}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.button}"
    height: "56px"
    padding: "0 32px"
  button-go-lg:
    backgroundColor: "{colors.leaf-green-deep}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.button}"
    height: "48px"
    padding: "0 24px"
  button-listen:
    backgroundColor: "{colors.sky-blue-deep}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "8px 16px"
  button-listen-hover:
    backgroundColor: "{colors.sky-ink}"
  button-plain:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "8px 16px"
  button-plain-hover:
    backgroundColor: "{colors.slate-wash}"
  round-button-listen:
    backgroundColor: "{colors.sky-blue}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    size: "44px"
  round-button-record:
    backgroundColor: "{colors.cherry-red}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    size: "56px"
  round-button-wash:
    backgroundColor: "{colors.slate-wash}"
    textColor: "{colors.slate-body}"
    rounded: "{rounded.pill}"
    size: "44px"
  grade-chip:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.chip}"
    height: "44px"
  grade-chip-active:
    backgroundColor: "{colors.sky-wash}"
    textColor: "{colors.sky-ink}"
    rounded: "{rounded.chip}"
    height: "44px"
  grade-chip-lg:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.chip}"
    height: "64px"
    padding: "0 20px"
  text-field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.field}"
    height: "44px"
    padding: "4px 14px"
  word-sticker:
    backgroundColor: "{colors.sky-blue}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.sticker}"
    padding: "12px"
  flip-tray:
    backgroundColor: "{colors.slate-wash}"
    textColor: "{colors.slate-ink}"
    rounded: "24px"
    padding: "16px 20px"
  sticker-card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.sheet}"
    padding: "32px"
  app-sheet:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
  stat-tile:
    backgroundColor: "{colors.slate-wash}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.chip}"
    padding: "12px 14px"
  play-button:
    backgroundColor: "{colors.sky-blue}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    size: "40px"
  nav-item-active:
    backgroundColor: "{colors.leaf-wash}"
    textColor: "{colors.forest-green}"
    rounded: "{rounded.nav}"
    height: "64px"
  verdict-pass:
    backgroundColor: "{colors.leaf-wash}"
    textColor: "{colors.forest-green}"
    rounded: "{rounded.pill}"
    height: "44px"
  verdict-fail:
    backgroundColor: "{colors.cherry-wash}"
    textColor: "{colors.cherry-red-deep}"
    rounded: "{rounded.pill}"
    height: "44px"
---

# Design System: 4KidStudy

## Overview

**Creative North Star: "The Sticker Book"**

4KidStudy feels like a child's sticker book left open on a table: saturated, die-cut fields with fat white borders, hand-placed at slight angles, sitting on a pale lime ground or a clean white sheet. Every control is something a small finger wants to press, and it looks pressable: buttons and chips stand on a thicker bottom edge and sink onto it when tapped. Type is Nunito at its heaviest, rounded and friendly, so a headline reads as loud and warm rather than corporate.

Density is low and targets are big. The app serves children aged 6 to 11 and the parents beside them, so contrast is high (slate ink on white or lime), labels are short, and English always appears next to Vietnamese rather than replacing it. Colour carries meaning by family (green is go and correct, sky is listen and link, red is speak and wrong, yellow is reward), and the remaining sticker hues exist to make a sheet of words feel like a full set. Inside the learner app the book becomes a binder: the same lime ground, with each section a white sheet laid on it, and the four sections colour-coded so a child can find one by colour as well as by word.

The system is light-only. `app/globals.css` defines no dark token block; its `dark:` variant applies only under an explicit `.dark` ancestor, which no surface sets.

**Key Characteristics:**

- Chunky 3D controls: a 4px bottom ledge (with a 2px side edge on white faces) that collapses on press.
- Die-cut stickers: saturated fills, 4–7px white borders, a 2px slate hairline outside, soft ink-tinted drop shadows, small hand-placed tilts.
- Nunito 900 for everything that must be read first; 800 for the English echo line.
- Pale lime page ground, white sheets and sections, slate ink (never pure black) for text.
- Bilingual pairing: Vietnamese leads, English follows in a coloured echo.

## Colors

A saturated toy-box palette (green, sky, yellow, red plus four sticker hues) on slate ink and a pale lime ground. Each family has a fill, a deeper ledge or text shade, and a pale wash; the code names them `leaf`, `leaf-deep`, `forest`, `leaf-wash`, `sky`, `sky-deep`, `sky-ink`, `sky-wash` and so on in `app/globals.css`, and surfaces use those utilities, never hex.

### Primary

- **Leaf Green** (`leaf-green`, `leaf`): the brand hue. Progress fills (study and lesson progress bars, stat bars), the correct-answer border, the active Học tab's edge, and a sticker field. It is too light to carry white text.
- **Leaf Green Deep** (`leaf-green-deep`, `leaf-deep`): the fill of every white-text "go" button (Đăng ký, Bắt đầu học, Tiếp tục, Vào luyện tập, Kiểm tra), completed-lesson discs, and the streak chart's bars. The shadcn `--primary` token resolves to this colour.
- **Forest Green** (`forest-green`, `forest`): the go button's ledge and hover fill, the wordmark, emphasised words inside headlines, Vietnamese meanings on a flipped card, correct-verdict text, and the full-bleed parents section.
- **Leaf Wash** (`leaf-wash`): the ground of pass verdicts, success messages, a correct answer tile and the "done" hint pill.

### Secondary

- **Sky Blue** (`sky-blue`, `sky`): listening and focus. The round listen button, the focus ring (at 50% alpha), the picked answer tile's border, the active grade chip and the Luyện tập tab edge, a sticker field. It carries white icons, not white text.
- **Sky Blue Deep** (`sky-blue-deep`, `sky-deep`): the `primary` button fill (Chấm điểm), text links, the round listen button's ledge, the XP chart's bars.
- **Sky Ink** (`sky-ink`): the English echo line on every learner heading, the active grade chip's text, the primary button's ledge.
- **Sky Wash** (`sky-wash`): the picked tile, the active grade chip, un-done lesson and sentence number discs, and the learner's own leaderboard row.

### Tertiary

- **Sunshine Yellow** (`sunshine-yellow`, `sun`): reward and highlight. A full-bleed section ground, the gold rank disc, the trophy, text selection, a sticker field. Text on it is Slate Ink or the sun browns, never white. **Sun Deep** (`sun-deep`) is its ledge; **Sun Ink** (`sun-ink`) and **Sun Body** (`sun-body`) are text on **Sun Wash** (`sun-wash`), the ground of the "still to do" hint pill and the hint popover.
- **Cherry Red** (`cherry-red`, `cherry`): speaking and wrong. The record button, the `danger` button, the wrong-answer border, a sticker field. **Cherry Red Deep** (`cherry-red-deep`) is its ledge and all red text; **Cherry Wash** (`cherry-wash`) grounds fail verdicts, form errors and a wrong tile.
- **Grape** (`grape-purple`, `grape-ink`, `grape-wash`): a sticker field, and the Hồ sơ (profile) section's colour in navigation: Grape edge on Grape Wash with Grape Ink text.
- **Tangerine** (`tangerine-orange`): a sticker field, the streak flame and the bronze rank disc.
- **Lagoon Teal, Bubblegum Pink** (`lagoon-teal`, `bubblegum-pink`): word-sticker and exercise-tile fields only.

### Neutral

- **Slate Ink** (`slate-ink`, `ink`): all headings, primary text, and plain-button text. Replaces black throughout.
- **Slate Body** (`slate-body`, `ink-body`): paragraph text, secondary lines, and every label that sits on a wash.
- **Slate Meta** (`slate-meta`, `ink-meta`): phonetics on the homepage, placeholders, keyboard-key badges, ghost buttons. Only on white.
- **Slate Edge** (`slate-edge`, `edge`): button, chip, field and card borders, the 2px hairline ring around stickers, the chart grid.
- **Slate Wash** (`slate-wash`, `wash`): stat tiles, example boxes, progress tracks, empty states, row dividers inside sheets, plain-button hover.
- **Lime Ground** (`lime-ground`, `lime`): the page ground of the homepage, the learner app, auth and the lesson player; the sidebar buddy's speech bubble. **Lime Rule** (`lime-rule`) draws the shell's borders on that ground (sidebar, mobile header, bottom nav, lesson header) and the progress track's inset ring.
- **Mint on Forest** (`mint-on-forest`): body and echo text on the Forest Green section.
- **Paper White** (`paper-white`): sticker borders, sheets, cards and sections.

### Named Rules

**The Colour Means Something Rule.** Green is go/correct, sky is listen/link/focus, red is speak/wrong, yellow is reward. The other sticker hues carry no answer state: they fill word sets and exercise tiles, and grape marks the profile section only as a wayfinding colour.

**The Section Colour Rule.** Each learner section keeps one family everywhere it is named: Học leaf, Luyện tập sky, Xếp hạng sun, Hồ sơ grape (`components/nav-items.ts`).

**The White Text Needs Depth Rule.** White text sits on Leaf Green Deep or darker, Sky Blue Deep or darker, Cherry Red Deep, Slate Ink, or the Forest Green section. White on Leaf Green Deep and on Cherry Red (about 3.3:1) is accepted for large bold button labels only, never for body text. Never on Leaf Green, Sky Blue or Sunshine Yellow.

**The Wash Label Rule.** Text on a wash (stat tiles, example boxes, pills) uses Slate Body or darker, never Slate Meta.

## Typography

**Display Font:** Nunito (loaded with `next/font/google`, applied to `<body>`)
**Body Font:** Nunito
**Label Font:** Nunito

**Character:** One rounded sans used at its extremes. Weight 900 headlines feel bold and toy-like; regular-weight body copy stays calm for the parent reading it.

### Hierarchy

- **Display** (`display`): the one homepage hero headline, balanced wrapping; key words recoloured Forest Green.
- **Headline** (`headline`): homepage section headings. Closing call-to-action headings step down to 1.875–2.25rem.
- **Page title** (`page-title`): the one learner page heading (`components/page-heading.tsx`), 1.875rem rising to 2.25rem from `sm`. Auth cards use the same size centred; error, empty and study headers step down to 1.5rem.
- **Title** (`title`): sheet titles (1.25rem), topic and unit names (1.25–1.5rem), lesson rows (1.125rem), word names on stickers. A flashcard word is the exception at 2.25–3rem.
- **Echo** (`echo`): the English line directly under a Vietnamese heading, always in a contrasting hue (Sky Ink in the app, Sky Blue Deep on the homepage's white or lime, dark amber on yellow, Mint on Forest Green). It runs 1.125rem under page titles, 1rem under card titles, 0.875rem under sheet titles.
- **Body** (`body`): paragraphs, 1rem on phones and 1.125rem from `sm`, capped at 32–34rem wide.
- **Label** (`label`): weights 700–800 at 0.875–1rem for captions, stat labels and form labels (1rem, 800, Slate Ink). Buttons use 700; numbers are 900 with tabular figures.

### Named Rules

**The Heavy Or Calm Rule.** Headings, names and prompts are 800–900; running paragraphs are 400; short list points and labels are 700. Weight 600 appears only for Vietnamese glosses and small captions.

**The Echo Rule.** Every Vietnamese heading is followed by its English echo line. English never replaces the Vietnamese lead.

**The vi-VN Rule.** Dates and grouped numbers are formatted with the `vi-VN` locale (`toLocaleDateString("vi-VN")`, `toLocaleString("vi-VN")`).

## Layout

Content sits in a centred container capped at `container` (1200px) with a `gutter` of 16px on phones and `gutter-wide` of 32px from `sm`. Homepage sections alternate full-bleed grounds (lime, white, yellow, forest green) with vertical padding of `section` (80px), growing to `section-wide` (112px) from `sm`. At `lg`, sections become asymmetric two-column grids (roughly 4.5:7.5 in the hero, 5:7 for lessons, 1:1 for the illustrated sections) and stack to one column below that. Sticker grids run 2 columns on phones and 4 from `sm`, with gaps of 12px on phones and 20px from `sm`; at `lg` the grid grows to fill the sheet's height and spreads its rows evenly, with the flip tray pinned below it.

The learner shell (`app/(main)/layout.tsx`) is a lime ground with a fixed `sidebar` (256px) white column from `lg`. Below `lg` it swaps to a 64px white top bar (logo, XP and streak) and a fixed four-tab bottom nav, so content pads 64px at the top and 128px at the bottom on phones. Pages open with the grade chips, then the page heading, then white sheets on the lime; practice runs sheets in a main column beside a stats sheet at `lg`. Flashcard and sentence study run in a single column (max 42rem). The lesson player (`app/(lesson)`) is full-screen with no shell: a sticky lime header with exit, progress, the lesson title and right / wrong / points pills in their washes, a 1000px content column, and a sticky footer.

## Elevation & Depth

Depth has two jobs. Controls get a **ledge**: a solid bottom edge in a darker shade of the control's colour (a 4px bottom border, or a 4–5px zero-blur shadow on round buttons) that shrinks on press while the face moves down. Stickers and sheets get a **lift**: a soft, negatively spread drop shadow tinted with ink, green or the section's own hue, never neutral grey-black.

### Shadow Vocabulary

- **Ledge** (`border-bottom: 4px solid <shade>` → `2px` on `:active`, face moves 2px down): every 3D button, grade chip, active nav tab and answer tile.
- **Round ledge** (`box-shadow: 0 4px 0 <shade>` → `0 0 0` on `:active`, face moves 4px down): round buttons. Shades: `#0284C7` sky, `#BE123C` cherry, `#15803D` leaf, `#CBD5E1` wash. The homepage mic uses 5px.
- **Sticker rest** (`--shadow-sticker`: `0 0 0 2px #E2E8F0, 0 10px 18px -8px rgba(61,70,93,0.35)`): word stickers and every framed picture (topic covers, flashcard and sentence images). Grows to `--shadow-sticker-hover` (`0 16px 24px -10px rgba(61,70,93,0.45)`).
- **Sticker peeled** (`0 0 0 2px #E2E8F0, 0 34px 40px -14px rgba(61,70,93,0.55)`): a flipped sticker lifted off the sheet.
- **Sheet on lime** (`--shadow-sheet-lime`: `0 0 0 2px #D3EEC2, 0 24px 40px -28px rgba(21,128,61,0.45)`): every white sheet on the lime ground (learner sheets, flashcard faces, auth card, error and empty sheets).
- **Correct lift** (`0 14px 22px -12px rgba(21,128,61,0.6)`, raised 4px, tilted −2°): a correct answer tile peeling up.
- **Section card** (`0 30px 50px -24px <section hue at 0.55–0.7>`): white illustrated cards on coloured homepage sections.
- **Sheet rise** (`0 -24px 60px -30px rgba(21,128,61,0.45)`): the white sheet rising from the homepage hero.

### Named Rules

**The Pressable Must Look Pressable Rule.** Anything tappable that is not plain text wears a ledge. Anything that is not tappable does not.

## Shapes

Everything is rounded, and radius grows with size: buttons `button` (about 8px), fields `field` (12px), grade chips, stat tiles and message boxes `chip` (16px), icon tiles `tile` (18px), nav tabs and answer tiles `nav` (20px), inner cards and framed pictures `card` (22px), word stickers `sticker` (26px), learner sheets `panel` (28px), auth card, flashcard faces and homepage sheets `sheet` (32px, 40px from `sm` for the hero sheet), and `pill` for badges, verdicts, round buttons and progress bars. Stickers and framed pictures carry thick white borders (6px on stickers and flashcard faces, 5px on pictures, 4px on small tiles) so they read as die-cut. Small tilts (−7° to 4°) make stickers, framed pictures and mascots feel hand-placed. Rows inside sheets use 2px Slate Wash dividers.

## Components

### Buttons

Chunky, glossy-free and physical: a solid fill on a darker ledge (`components/ui/button.tsx`).

- **Shape:** gently rounded (`button`), heights 36 / 44 / 48px (sm / default / lg). Learner step actions use `lg` (often stretched to 56px); rows inside sheets use the default. The homepage hero call-to-action is 56px with 32px side padding, 1.125rem uppercase text.
- **White faces (`ledge`):** a 2px Slate Edge border with a 4px bottom ledge. Default and outline are white with Slate Ink text, hover to Slate Wash. Link-style actions such as Đăng nhập recolour the text to Sky Blue Deep.
- **Filled faces (`fillLedge`):** a 4px bottom ledge only, no side edge. `secondary` (go) is Leaf Green Deep on a Forest ledge; `primary` (listen, score) is Sky Blue Deep on Sky Ink; `danger` Cherry Red on Cherry Red Deep; `super` Sunshine Yellow with Slate Ink text on Sun Deep; `gray` Slate Ink.
- **Outline variants** keep the white face and recolour text and hover to their family's ink and wash. `ghost`, `link`, `sidebar` carry no ledge.
- **Press:** the ledge drops to 2px and the face moves 2px down, so the bottom edge stays put. Disabled keeps the full ledge at 50% opacity.
- **Focus:** a 4px Sky Blue ring at 50% alpha.

### Round Button

`components/learn/round-button.tsx`: an icon-only circle on a round ledge, in four tones (sky listen, cherry record, leaf, wash for secondary actions) and two sizes (44px, 56px). It always carries an `aria-label`. Model audio uses the Volume2 speaker; the child's own recording uses AudioLines, so the two never look alike.

### Grade Chips

The 3D button grammar applied to Lớp 1–5. White fill, Slate Edge border with 4px ledge, Slate Ink 900 text, `chip` radius, 44px. Hover and the current grade turn the border Sky Blue, the fill Sky Wash and the text Sky Ink. On learner pages they sit in a 5-column grid on phones and a row from `sm`; registration uses the same chips as a radio group (48px). The homepage adds a wrapping row of 64px chips at 1.25rem.

### Cards / Containers

- **Learner sheet:** Paper White, `panel` radius, Sheet on lime, 20–24px padding. Title (1.25rem 900) with its echo, then content. Practice units are accordion sheets: a tilted framed cover, unit name, a Leaf Wash count pill and a round chevron, with lesson rows below a Slate Wash divider.
- **Homepage card:** `sheet` radius, 6px white border, Section card lift, 24px padding (32px from `sm`).
- **Inner card:** white with a 2px Slate Edge border (Leaf when mastered), `card` radius, 16px padding.
- **Stat tile:** Slate Wash, `chip` radius, 12–14px padding, a tinted icon disc and Slate Body label, value in 1.25rem 900 tabular Slate Ink.

### Inputs / Fields

`components/ui/input.tsx`: 44px high, white, 2px Slate Edge border, `field` radius, 1rem bold Slate Ink text with regular Slate Meta placeholder. Hover darkens the edge; focus turns it Sky Blue with a 4px Sky ring at 25%. Invalid turns the border Cherry Red Deep with a faint cherry ring. Labels are 1rem 800 Slate Ink (Cherry Red Deep on error); messages are 0.875rem 700 Cherry Red Deep. Form-level errors and successes are `chip`-radius boxes on Cherry Wash or Leaf Wash with an icon and 700 text in the family's deep shade.

### Navigation

- **Sidebar** (`lg` and up): 256px white column with a 2px Lime Rule right border; mascot and Forest 900 wordmark, the XP and streak pills, then 64px tiles (18px label 900) with a 44px icon disc in the section's wash. The active tile takes its section colour: a 2px edge with a 4px ledge in the section hue, the wash fill, a white disc and the section's ink text. Inactive tiles are Slate Body with a Slate Wash hover. A mascot buddy greets the child by name in a lime speech bubble at the foot.
- **Bottom nav** (below `lg`): fixed white bar, 2px Lime Rule top border, safe-area padding, four 64px tabs (icon over 0.875rem 900 label) with the same section-coloured active state.
- **Mobile header** (below `lg`): 64px white bar, mascot and wordmark, compact XP and streak pills.
- **XP and streak pills:** white, 2px Slate Edge, pill radius, a sun trophy or tangerine flame, the number in 1.125rem 900 tabular Slate Ink and the unit in Slate Body (hidden in the compact form).
- **Homepage header:** mascot (40px) and Forest Green 900 wordmark, 800-weight anchor links with a 3px Leaf Green underline offset 8px on hover, then plain and go buttons.

### App Surfaces

- **Page heading** (`components/page-heading.tsx`): the one heading on every learner section: Vietnamese `page-title` h1, a 1.125rem Sky Ink echo, an optional Slate Body description, and an optional action on the right that wraps below on phones.
- **Study shell** (`components/learn/study-shell.tsx`): `StudyHeader` holds a 44px back button, the topic title clamped to two lines with a "Thẻ từ vựng · Word cards" style echo, a Học lại button, and a 16px progress bar (white track with a Lime Rule inset ring, Leaf fill with a white gloss stripe, easing over 500ms). `StudyNav` puts a hint pill first (Sun Wash with a mic while the card is unpassed, Leaf Wash with a check once passed), then two 56px buttons: Quay lại (plain) and TIẾP TỤC (go), which stays disabled until the card is passed. `StudyEmpty` is a white sheet with the mascot, title, echo and a go button back.
- **Recorder** (`components/learn/recorder-controls.tsx`): record (56px cherry round button) → recording (a stop square with a pinging halo, "Đang ghi âm…") → recorded (listen back, a `primary` Chấm điểm button, re-record) → analysing (a 12px sky progress bar) → a 44px verdict pill, Leaf Wash "✓ n% · Đạt" or Cherry Wash "✕ n% · Chưa đạt", beside listen-back and re-record.
- **Flashcard:** a 30–32rem white face (`sheet` radius, 6px white border, Sheet on lime) that flips in 3D over 500ms. The front holds a tilted framed picture, the word (2.25–3rem 900), phonetic, a 56px listen button and the recorder; the back shows the word, the Vietnamese meaning in Forest at the same size, and the example (English 800 Slate Ink, Vietnamese 600 Slate Body) in a Slate Wash box. A "Chạm vào thẻ" pill sits at the foot of both faces.
- **Sentence card:** a `panel` sheet with the framed picture and a whole-passage player on the left (from `md`), and a numbered list of inner cards on the right: a Sky Wash number disc (Leaf Deep with a check when mastered), the sentence in 1.25–1.5rem 900, its Vietnamese gloss, then listen, a Sun Wash hint button on a pale sun ledge, and the recorder.
- **Lesson rows** (practice): a 40px status disc (Sky Wash number, or Leaf Deep with a check once completed), the lesson name and question count, then Lịch sử (plain) and Vào luyện tập (go). The history sheet repeats the sheet header style with stat tiles, Sun Wash wrong-answer groups and expandable attempt cards.
- **Charts** (`app/(main)/leaderboard/_components/`): each sits in a `ChartSheet` with title, echo, range select and a 1.875rem 900 total. One series, no legend; bars at most 24px with 4px rounded data ends; a solid Slate Edge grid; axis text 13px 700 Slate Body; an ink-bordered tooltip on a `chip` radius. Streak bars are Leaf Green Deep columns, XP bars Sky Blue Deep horizontal bars. The plot is `aria-hidden`, with an `sr-only` table carrying the same data.
- **Weekly leaderboard:** rows with a 36px rank disc (gold Sun, silver Slate Edge, bronze Tangerine; Slate Wash after third), avatar, name and score. The learner's own row is Sky Wash with a Sky ring on the avatar and Sky Ink name, "(bạn)", and a Sky Wash "Hạng #n" pill in the header.
- **Lesson player:** answer tiles are white `nav`-radius faces on a Slate Edge ledge; picked is Sky Wash with a Sky edge; correct lifts and tilts in Leaf Wash; wrong nudges sideways in Cherry Wash (`nudge`, 0.35s). Number-key badges in tile corners appear only from `lg`; the "Enter" keycap hint from `sm`. The sticky footer turns Leaf Wash or Cherry Wash with a white verdict disc and rising feedback text, beside a 56px uppercase KIỂM TRA / TIẾP TỤC button (go, or danger after a wrong answer).
- **Auth card** (`app/(auth)/_components/auth-card.tsx`): a 440px white `sheet` on lime with the 72px mascot peeking over its top edge (landing once with `sticker-land`), a centred title and Sky Ink echo, the form, and a footer above a 2px Slate Wash rule. Submit buttons are 48px full-width uppercase go buttons.
- **Error sheet** (`components/error-sheet.tsx`): a white `panel` sheet with a tilted mascot, "Có lỗi xảy ra" with its echo, the cause in a Slate Wash box, then Thử lại (go) and Trang chủ (plain).

### Word Sticker (signature)

A 4:5 die-cut sticker in a sticker hue with a 6px white border, a white disc holding a flat 64×64-grid SVG illustration, and a white name plate (10px side padding) holding the word in Title and the Vietnamese meaning below it at 14px, rising to 15px when the sticker is at least 10rem wide, 700 weight, Slate Body, never wrapping. The front face has 12px padding inside its border. Tapping it speaks the word and flips it in 3D to a white back showing the word, phonetic, Vietnamese meaning in Forest Green, an example sentence, and a Sky Blue play button. A flipped sticker lifts 10px, scales to 1.06 and tilts to −7°. Motion uses `cubic-bezier(0.16,1,0.3,1)` over 500ms; one sticker peels in once on load (`sticker-peel`, 900ms, 400ms delay). All of it is disabled under `prefers-reduced-motion`.

### Flip Tray

A rounded tray (24px radius, Slate Wash fill, 12–16px by 20px padding) at the foot of the hero sticker sheet that tracks the signature interaction. Its status line (800 weight, Slate Ink, announced with `aria-live="polite"`) reads "Đã lật n/8 thẻ" with an English echo "Flip all 8" in Slate Meta. Below it, a 12px white track holds a Leaf Green progress fill that eases its width over 500ms with `cubic-bezier(0.16,1,0.3,1)`; the transition is off under `prefers-reduced-motion`. When all eight stickers are flipped, the line becomes "Giỏi lắm! Bé đã lật hết thẻ." (echo "Well done!") and a 44px go link, "Học tiếp từ mới", appears: Leaf Green Deep fill, Forest Green 4px ledge, 16px radius, uppercase 900 text, linking to `/register`.

### Exercise Tile

A 56px rounded square (`tile`) in a sticker hue with a 4px white border, a 2px Slate Edge ring, a hue-shaded drop shadow, a white line icon and a small tilt. It marks an exercise type in a divided list.

### Mascot Mark

`public/mascot.svg`, a green gradient rounded square with a face, always paired with the "4KidStudy" wordmark in the header, sidebar and auth layout (36–40px). It stands alone at 56–88px as a companion: beside a closing call to action, at the sidebar's foot, over the auth card, and on error and empty sheets.

## Do's and Don'ts

### Do:

- **Do** give every pressable control a darker ledge (4px bottom border or a zero-blur offset shadow) that shrinks on `:active`.
- **Do** put white text on Leaf Green Deep (#16A34A) or darker, never on Leaf Green (#22C55E), and keep white-on-Leaf-Deep and white-on-Cherry to large bold button labels.
- **Do** use Slate Ink (#3D465D) for headings and primary text instead of black.
- **Do** follow each Vietnamese heading with an English echo line in Sky Ink (or the section's echo colour).
- **Do** open every learner page with `PageHeading`, and put each section's content on a white sheet on the lime ground.
- **Do** colour each learner section by its family everywhere it is named: Học leaf, Luyện tập sky, Xếp hạng sun, Hồ sơ grape.
- **Do** give icon-only buttons an `aria-label`, and use Volume2 for model audio and AudioLines for the child's own recording.
- **Do** keep charts to one series with no legend, bars at most 24px with 4px rounded data ends, a Slate Edge grid, and an `sr-only` table of the same data.
- **Do** give stickers and framed pictures a white border and a soft, tinted drop shadow, and tilt them a few degrees.
- **Do** take every interface icon from Phosphor via `components/icons.tsx` (bold by default; section icons duotone at rest and fill when active; achievement badges fill), and use flat 64×64-grid SVGs for word art.
- **Do** format dates and numbers with `vi-VN`.
- **Do** label example numbers in illustrative cards as samples (Ví dụ minh họa) so parents are never shown invented results as real.
- **Do** wrap sticker, peel, flip and progress motion in `motion-safe` / `motion-reduce` guards.

### Don't:

- **Don't** use sticker hues (purple, orange, teal, pink) for answer state; state colours are green, sky, red and yellow only.
- **Don't** put a ledge on anything that cannot be tapped.
- **Don't** use Slate Meta for text on a wash; use Slate Body.
- **Don't** use neutral grey or black drop shadows; tint lifts with ink, green or the section hue.
- **Don't** set headings lighter than 800 or running paragraphs heavier than 400.
- **Don't** use square corners on any control or container.

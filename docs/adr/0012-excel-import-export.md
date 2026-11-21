# 0012. Excel import and export

- Status: Accepted
- Date: 2026-11-21

## Decision

**Import flow** (flashcards, sentences, exercises):

1. Upload every asset file to Cloudinary and build a filename → URL map.
2. Parse the workbook. A cell that already holds an `http(s)` URL is used as
   is. Anything else is a filename (path stripped, matched
   case-insensitively for sentences) looked up in the map.
3. Write every row in one transaction with a long timeout, because
   serverless databases are slow.
4. Return a summary (counts, failures), not the created rows, to keep the
   response small.

**Exercise sheet.** Columns are matched in either case (`Type`/`type`,
`optT`/`optt`/`OPTT`). The header row is read raw, because the template
repeats `optF`, so repeated `optF` columns are renamed `optF1`–`optF3`.

| Type | `optT` | `optF1`–`optF3` |
| --- | --- | --- |
| `SELECT_IMAGE` | correct image | wrong images |
| `MULTIPLE_CHOICE`, `LISTENING` | correct text | wrong texts |
| `MATCHING` | one pair `left|right` | more pairs `left|right` |
| `PRONUNCIATION` | none | none |

Each `MATCHING` pair (for example `Car|xe hơi` or `CarImg|g1-u2-car.png`)
creates two options with the same `matchKey`.

**Sentence sheet.** One row is one sentence image with 1–4 sentences
(`sen01`–`sen04`, each with `Vi` and `audio` columns): 14 columns in all. A
cell holding a literal `\n` counts as empty.

**CSV import (exercises).** A row that duplicates an existing exercise
(same lesson and order) is skipped, but its CSV id is still mapped to the
existing exercise, so the options file can reference it.

**Admin import proxy** (`app/api/admin-import/[...path]/route.ts`). The
browser can't attach the admin's access token, which is an httpOnly cookie
(ADR 0004), so imports post to this same-origin route. It forwards only the
three import endpoints, keeps the multipart `Content-Type` (and its
boundary), streams the body instead of buffering it, and expires the topic
cache on success (ADR 0014).

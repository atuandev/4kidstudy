# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Learners:** Vietnamese primary-school children, grades 1–5 (roughly ages 6–11), learning English. They use the app themselves: lessons, flashcards, sentence practice, and the leaderboard.
- **Deciders (primary audience for the public homepage):** parents. A parent finds the site, decides it is worth their child's time, and creates the account with an email address. The child is often next to them when they look, so the homepage should also invite the child in.

## Product Purpose

4KidStudy is an English-learning web app for Vietnamese children in grades 1–5. Content is organised by grade, then topic, then lesson. Success: a child keeps coming back daily, finishes lessons, and can hear, read and say the words for each topic.

## Positioning

Built for Vietnamese children specifically: every word and sentence carries a Vietnamese meaning, content is split by school grade (lớp 1–5), and kids practise speaking aloud with automatic pronunciation scoring rather than only tapping answers.

## Operating Context

- A learner picks their grade (`/grade/[n]/...`), then works through topics and lessons.
- Lesson exercise types: select the right image, multiple choice, matching pairs, listening (hear and choose), and pronunciation (record your voice, scored on accuracy, fluency and completeness).
- Flashcards per topic: English term, phonetic transcription, Vietnamese meaning, example sentence (EN + VI), image, audio, and voice recording.
- Sentence practice per topic: a picture with sentences describing it, with audio and Vietnamese meaning/hint.
- Motivation: XP (lesson complete, correct answers, streak bonus), daily streak, hearts, and a leaderboard. Practice page shows attempt history and accuracy statistics.
- Accounts: email registration with verification, login, password reset. Admins manage topics, lessons, exercises, flashcards and sentences.

## Capabilities and Constraints

- Stack: Next.js (App Router) + Tailwind v4 + shadcn/Radix UI in `apps/web`; NestJS API in `apps/api`. Font: Nunito.
- App UI copy is Vietnamese. The public homepage is bilingual: Vietnamese is the main language, English appears alongside it and as the learning content itself.
- Not built (must not be claimed): spaced repetition, weekly parent reports, phonics-first curriculum, adaptive difficulty, native-speaker tutors, mobile apps.
- Open decision: whether topics follow a specific Vietnamese textbook series (e.g. the MOET primary English curriculum). Do not claim alignment until confirmed.
- Open decision: pricing. Nothing in the code describes paid tiers; do not mention price, free trials, or "free forever".

## Brand Commitments

- Name: **4KidStudy** (capital K, capital S). "4KisStudy" is a misspelling.
- Mascot: `public/mascot.svg`, used as the logo mark.
- Existing illustrated icons in `public/`: `learn.svg`, `practice.svg`, `leaderboard.svg`, `profile.svg`, `heart.svg`, `points.svg`, `streak-off.svg`, `finish.svg`, `hero.svg`.

## Evidence on Hand

- Real product capabilities listed above (from code and data model).
- No testimonials, user counts, school partnerships, ratings, press, or learning-outcome data exist. Future work must not invent any of them.

## Product Principles

1. Honest to the parent: show what the child will actually do, never a feature that is not built.
2. Inviting to the child: the first impression should feel like play, not homework.
3. Vietnamese first, English as the subject: parents read in Vietnamese; English is what the child learns.
4. Speaking matters: pronunciation practice is the clearest difference and should be shown, not just listed.

## Accessibility & Inclusion

Learners are young children, some still learning to read in Vietnamese: large tap targets, short labels, audio support, and icons alongside text. Parent-facing pages must read well on phones, where most parents will first see them.

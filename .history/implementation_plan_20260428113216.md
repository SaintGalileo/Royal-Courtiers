# Ingest Event Data and Populate Schedules

The goal is to update the application with the official event itinerary and competition schedules as provided in the handwritten notes. This involves updating multiple pages to ensure all dates and events are accurate and consistent.

## User Review Required

> [!IMPORTANT]
> The handwritten notes specify dates starting from June 1st through August 16th. The current `itinerary` page focuses on the peak week (Aug 10-16). I will maintain this focus for the itinerary but update the competition-specific pages with the full schedule (preliminaries in July, etc.).

## Proposed Changes

### Data Layer (Mock Data)

I will update the hardcoded `MOCK_MATCHES` and `ITINERARY` constants in the following components to reflect the new schedule.

---

### Itinerary Page

#### [MODIFY] [page.tsx](file:///c:/Users/enwon/Github/Royal-Courtiers/app/itinerary/page.tsx)

- Update the `ITINERARY` constant with detailed August events:
  - **Aug 10**: Flag-off, Logo Unveiling, Hall of Fame Reveal, Essay Topic Announcement, Chess, Scrabble, Ludo.
  - **Aug 11**: Volleyball, Badminton, Table Tennis, Track Events (Stadium).
  - **Aug 12**: Football Finals, Pageantry Phase 1 (Quiz/Spelling Bee).
  - **Aug 13**: Super Marching Round, Singing in the Vestry, Keyboard Competition.
  - **Aug 14**: Creation Day Celebration in the Great Hall followed by outing to 26 Mbukpa Holy Chapel and finally Feast & Tales by Moonlight immediately after the Holy Father's Advice & Blessings.
  - **Aug 15**: Cultural Day 2.0 featuring Pageantry Phase 2.0.
  - **Aug 16**: Grand Finale Service with performances from choral champions, debate finals, and rendition of winning composition by the Body.

---

### Sports Competitions

#### [MODIFY] [page.tsx](file:///c:/Users/enwon/Github/Royal-Courtiers/app/sports/page.tsx)

- Update `MOCK_MATCHES` to include:
  - **Football**:
    - July 24/25: SF 1st leg.
    - Aug 3/4: SF 2nd leg.
    - Aug 8: 3rd Place Match.
    - Aug 12: Grand Finals.
  - **Junior Games**: Aug 1 (Sack & Egg race, Filling the basket).
  - **Track Events**: Aug 11 (Stadium).
  - **Indoor Games**: Aug 10 (Chess, Scrabble, Ludo).
  - **Court Games**: Aug 11 (Volleyball, Badminton, Table Tennis).

---

### Choral Competitions

#### [MODIFY] [page.tsx](file:///c:/Users/enwon/Github/Royal-Courtiers/app/choral/page.tsx)

- Update `MOCK_MATCHES` to include:
  - **Composition Comp**: Started June 1, Submission June 20, Final Rendition Aug 16.
  - **Solo Comp**: July 9.
  - **Duet Comp**: July 16.
  - **Quartet Comp**: July 23.
  - **Keyboard Comp**: Aug 13.

---

### Extracurricular Competitions

#### [MODIFY] [page.tsx](file:///c:/Users/enwon/Github/Royal-Courtiers/app/extracurricular/page.tsx)

- Update `MOCK_MATCHES` to include:
  - **Debate**:
    - July 8: SF1.
    - July 15: SF2.
    - July 22: 3rd Place.
    - Aug 16: Finals.
  - **Essay Writing**: Aug 11 (Topic Announcement after Morning Devotion; essay to be submitted on or before 10 a.m. August 1).
  - **Quiz / Spelling Bee**: Aug 13 (Pageantry Phase 1).
  - **Pageantry**:
    - Aug 13: Phase 1.
    - Aug 15: Phase 2.0 (Cultural Day).

## Verification Plan

### Manual Verification

- Navigate to `/itinerary` and verify August dates match the notes.
- Navigate to `/sports`, `/choral`, and `/extracurricular` to verify the category-specific schedules include the new July and August dates.
- Use the tabs on each competition page to ensure the relevant events show up for each sub-category.

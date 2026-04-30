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
    - **Aug 10**: Flag-off, Logo Unveiling, Hall of Fame.
    - **Aug 11**: Essay Topic, Chess, Scrabble, Ludo.
    - **Aug 12**: Volleyball, Badminton, Table Tennis, Track Events (Stadium).
    - **Aug 13**: Football Finals, Pageantry Phase 1 (Quiz/Spelling Bee).
    - **Aug 14**: Super Marching Round, Singing in the Vestry, Keyboard Competition.
    - **Aug 15**: Creation Day Celebration (Feast, Tales by Moonlight) & Cultural Day 2.0 (Pageantry Phase 2.0).
    - **Aug 16**: Grand Finale Service with performances from champions and winning composition.

---

### Sports Competitions

#### [MODIFY] [page.tsx](file:///c:/Users/enwon/Github/Royal-Courtiers/app/sports/page.tsx)
- Update `MOCK_MATCHES` to include:
    - **Football**: 
        - July 24/25: SF 1st leg.
        - Aug 3/4: SF 2nd leg.
        - Aug 8: 3rd Place Match.
        - Aug 13: Grand Finals.
    - **Junior Games**: Aug 1 (Sack & Egg race, Filling the basket).
    - **Track Events**: Aug 12 (Stadium).
    - **Indoor Games**: Aug 11 (Chess, Scrabble, Ludo).
    - **Court Games**: Aug 12 (Volleyball, Badminton, Table Tennis).

---

### Choral Competitions

#### [MODIFY] [page.tsx](file:///c:/Users/enwon/Github/Royal-Courtiers/app/choral/page.tsx)
- Update `MOCK_MATCHES` to include:
    - **Composition Comp**: Started June 1, Submission June 20, Final Rendition Aug 16.
    - **Solo Comp**: July 9.
    - **Duet Comp**: July 16.
    - **Quartet Comp**: July 23.
    - **Keyboard Comp**: Aug 14.

---

### Extracurricular Competitions

#### [MODIFY] [page.tsx](file:///c:/Users/enwon/Github/Royal-Courtiers/app/extracurricular/page.tsx)
- Update `MOCK_MATCHES` to include:
    - **Debate**:
        - July 8: SF1.
        - July 15: SF2.
        - July 22: 3rd Place.
        - Aug 13: Final (part of Pageantry Phase 1).
    - **Essay Writing**: Aug 11 (Topic Announcement).
    - **Quiz / Spelling Bee**: Aug 13 (Pageantry Phase 1).
    - **Pageantry**:
        - Aug 13: Phase 1.
        - Aug 15: Phase 2.0 (Cultural Day).

## Verification Plan

### Manual Verification
- Navigate to `/itinerary` and verify August dates match the notes.
- Navigate to `/sports`, `/choral`, and `/extracurricular` to verify the category-specific schedules include the new July and August dates.
- Use the tabs on each competition page to ensure the relevant events show up for each sub-category.

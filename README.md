# BetAnalyticsProClean

Repo curat pentru reconstrucția aplicației BetAnalytics Pro.

## Ce conține acest pas

- structură nouă React + Vite;
- Dashboard gol, intenționat;
- secțiunea Meciuri cu rubricile: Toate, Top, O1.5, BTTS, U3.5, Value;
- secțiunea Mai mult cu: Motor Unificat, Performanță Verdict, CLV Tracker, Analiză ML5, Istoric Meciuri;
- citire date din `public/data/*.json`;
- buton unic de reset pentru filtre, controlat doar din `MatchFilters.jsx`.

## Instalare locală

```bash
npm install
npm run dev
```

Apoi deschide adresa afișată de Vite, de obicei:

```txt
http://localhost:5173
```

## Locația fișierelor importante

```txt
src/components/matches/MatchesPage.jsx
src/components/matches/MatchFilters.jsx
src/components/matches/MatchCard.jsx
src/logic/matchCriteria.js
src/logic/performance.js
src/data/normalizeMatch.js
src/data/normalizeHistory.js
```

## Date

Fișierele JSON copiate din aplicația veche sunt în:

```txt
public/data/
```

Pentru următorul update de date, înlocuiești fișierele din acest folder cu fișierele generate de pipeline-ul Python.

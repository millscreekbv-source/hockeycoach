# Hockey Coach App

Single-file PWA voor hockeycoaches om spelers, wedstrijden en live wissels te beheren.

## Bestand
- `index.html` — de volledige app (HTML + CSS + JS, geen frameworks, geen dependencies)

## Publicatie
- GitHub: https://github.com/millscreekbv-source/hockeycoach
- Live URL: https://millscreekbv-source.github.io/hockeycoach/

## Dataopslag
- `localStorage` key: `hockeyCoach_v3`
- Structuur: `state = { players[], matches[], live }`
- Data is lokaal per apparaat/browser — geen centrale database

## State structuur

### Players
```js
{ id, name, positions[] }
// positions: ["LA","RA","LM","RM","LV","RV","MV","MA","SP"]
```

### Matches
```js
{ id, name, date, periods, absentPlayers[], events? }
// events (na afsluiting): { startingLineup, goals, substitutions, minutesPlayed }
```

### Live (actieve wedstrijd)
```js
{
  matchId,
  period, timerRunning, elapsedSeconds,
  fieldPlayers[],     // { slotId, playerId, posLabel, px, py }
  benchPlayers[],     // player IDs
  absentPlayers[],    // player IDs (uitgesloten van alles)
  minutesPlayed{},    // playerId → seconden
  benchStints{},      // playerId → aantal keer op bank
  startingLineup[],   // snapshot bij bevestiging opstelling
  goals[],            // { t (minuut), scorerId, assistId }
  substitutions[],    // { t, inId, outId, slotId (= posLabel) }
}
```

## Belangrijke functies

| Functie | Beschrijving |
|---|---|
| `confirmLineup()` | Bevestigt opstelling, filtert afwezigen, initialiseert benchStints |
| `getSubSuggestions()` | Wisselvoorstellen: posScore×0.4 + tijdsverschil×4 + stintVerschil×25 |
| `endMatch()` | Slaat events op in `m.events`, null-t `state.live` |
| `openMatchDetail(id)` | Toont wedstrijdverslag: opstelling, wissels met positie, speeltijd |
| `showConfirm(msg, fn)` | Custom confirm modal (iOS PWA blokkeert native `confirm()`) |
| `openPlayerPopup(id)` | Toont spelerinfo + bankstints tijdens live wedstrijd |

## UI-structuur
- Views: `#view-matches`, `#view-players`, `#view-live`
- Modals: `.modal-backdrop` — schuiven van boven (keyboard-safe op mobiel)
- Layout: `height: 100dvh`, `.view-scroll` (flex:1, overflow-y:auto), `.view-footer` (flex-shrink:0)

## Mobiel / iOS
- `confirm()` geblokkeerd in iOS PWA standalone → altijd `showConfirm()` gebruiken
- Touch targets minimaal 44px hoog
- PWA installeerbaar via "Voeg toe aan beginscherm" in Safari

## Taal
Interface is Nederlands.

## Ontwikkelregels
- Geen frameworks, geen externe dependencies
- Alles in één `index.html`
- Geen comments tenzij de reden niet-voor-de-hand-liggend is
- Geen backwards-compatibility hacks
- Mobiel-first testen (iOS Safari PWA)

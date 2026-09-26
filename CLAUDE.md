# Hockey Coach App

Single-file PWA voor hockeycoaches om spelers, wedstrijden en live wissels te beheren.

## Bestanden
- `index.html` — de volledige app (HTML + CSS + JS, geen frameworks, geen dependencies)
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — PWA-installatie (enige toegestane extra bestanden)

## Publicatie
- Hosting: Netlify, site `hockey-coach` (id `af2aa88c-3e44-4c29-8724-e5468cbfb63e`), custom domain hockey-coach.online
- **Publiceren gaat met de Netlify CLI** (op de MacBook Air al ingelogd als Auke — niet opnieuw inloggen, geen token invoeren):
  ```
  export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22
  netlify deploy --prod --site af2aa88c-3e44-4c29-8724-e5468cbfb63e \
    --dir "<projectmap>/netlify-upload" --message "Versie X.Y: <wat>"
  ```
  Draai het commando **niet** vanuit de projectmap zelf: de CLI schrijft dan `.netlify/state.json` in de Drive-mount. Vanuit een tijdelijke map met een absoluut `--dir` gaat het goed. Controleer daarna hockey-coach.online: het codescherm toont het versienummer.
- Handmatig alternatief: drag & drop van de map `netlify-upload/` in de Deploys-tab
- `netlify-upload/` bevat alléén de 5 publicatiebestanden — NA ELKE WIJZIGING opnieuw vullen: `cp index.html manifest.webmanifest icon-192.png icon-512.png apple-touch-icon.png netlify-upload/`
- GitHub (backup/versiebeheer): https://github.com/millscreekbv-source/hockeycoach
- Oude live URL (GitHub Pages): https://millscreekbv-source.github.io/hockeycoach/

## Dataopslag
- `localStorage` key: `hockeyCoach_v3`
- Structuur: `state = { teams[], currentTeamId, players[], matches[], live }`
- `teams`: `{ id, name, color, formationId }` — spelers en wedstrijden hebben een `teamId`; alle lijsten zijn team-gefilterd via `state.currentTeamId`, live-functies via `match.teamId`. `formationId` = spelsysteem van het team (instelbaar in teambeheer, fallback `DEFAULT_FORMATION` via `currentTeamFormationId()`)
- `loadState()` migreert oude data eenmalig naar een standaardteam
- Data is lokaal per apparaat/browser — geen centrale database

## State structuur

### Players
```js
{ id, name, number, teamId, preferredPositions[], fixedKeeper?, guestForMatchId? }
// preferredPositions: { position (uit ALL_POSITIONS), priority }
// guestForMatchId: invaller — hoort bij één wedstrijd (aangemaakt via het wedstrijdformulier), telt overal mee via matchPlayers(match) maar niet in playersOfTeam(); wordt verwijderd met de wedstrijd
// fixedKeeper: true = vaste keeper — start altijd op GK (auto-opstelling +1000/−500), nooit in wisselvoorstellen, doorschuif-opties of bestBenchCandidateFor (behalve voor het GK-slot); handmatig wisselen blijft mogelijk. Bij opslaan wordt GK als voorkeur 1 afgedwongen; CSV-kolom 8 'Vaste keeper' = ja/x/1
```

### Matches
```js
{ id, teamId, date, opponent, homeAway, absentPlayers[], config, events? }
// config: { periods, periodSeconds, subIntervalMinutes, type ('veld'|'zaal'), formationId }
// events (na afsluiting): { startingLineup, goals, substitutions, minutesPlayed }
```

### Formaties & speeltijden
- `FORMATIONS`: 9× veld 11-tal (1-3-4-3 t/m 1-2-4-4), jongste jeugd (3-tal, 6-tal, 8-tal 1-3-3-1, 9-tal 1-3-3-2) en 5× zaal (1-2-2-1 e.a.). Elk slot heeft `prefs` (spelersvoorkeuren die als exacte match tellen in `scorePlayerForSlot`); 3-tal/6-tal hebben geen GK-slot
- Slots per wedstrijd via `matchFormation(m)` / `liveSlots()` — nooit een globale slotlijst gebruiken
- `TIME_PRESETS`: KNHB-presets veld (O7 2×15 t/m senioren 4×17,5) en zaal (O8 2×10, O9/O10 2×15, breedte 2×17,5, top 2×20)

### Live (actieve wedstrijd)
```js
{
  matchId,
  period, timerRunning, timerSeconds,   // timer reset per periode
  fieldPlayers[],       // { slotId, playerId, posLabel, px, py }
  benchPlayers[],       // player IDs
  absentPlayers[],      // player IDs (uitgesloten van alles)
  minutesPlayed{},      // playerId → seconden
  lastSwitchAt{},       // playerId → matchSeconds van laatste veld/bank-wissel (voor kleurcodering)
  benchStints{},        // playerId → aantal keer gewisseld naar bank (start = 0, ook voor bankstarters)
  startingLineup[],     // snapshot bij bevestiging opstelling
  goals[],              // { team, minute, scorerId, assistId }
  substitutions[],      // { minute, inId, outId, slotId, atSeconds, prevSwitchOut, prevSwitchIn }
                        //   atSeconds/prevSwitch* zijn er voor undoRepairSub(): exact terugboeken
  lastPeriodEndSeconds, // timerSeconds bij de vorige periodewissel (voor 'periode terug')
  plannedSubs[],        // wisselplan: { outId, inId, slotId }
  planTouched,          // false = plan volgt live suggesties; true = bevroren na coach-ingreep
  prevBenchStarters[],  // wie vorige wedstrijd op bank startte → voorrang bij auto-opstelling
  prevLastOutIds[],     // wie vorige wedstrijd als laatst gewisseld werd → eerder wisselen (+20)
  prevStartingLineup[], // voor positiecontinuïteit bij auto-opstelling (+8)
}
```
`minute` in events = totale wedstrijdminuut (1-based, over periodes heen) via `currentMatchMinute()`.

## Belangrijke functies

| Functie | Beschrijving |
|---|---|
| `confirmLineup()` | Bevestigt opstelling, filtert afwezigen, initialiseert benchStints op 0 |
| `onLineupSlotChange()` | Opstellingsmodal is reactief: muteert `state.live` direct en re-rendert; selects tonen alleen bank + ruilopties |
| `matchNotStarted(lv)` | Vóór de aftrap: positiewijzigingen updaten `startingLineup` i.p.v. events te loggen |
| `isFixedKeeper(pid)` | Helper voor de vaste-keeper-vlag; gebruikt in wisselvoorstellen, via-opties en bankkandidaat |
| `getSubSuggestions()` | Wisselvoorstellen: posScore×0.4 + tijdsverschil×4 + stintVerschil×25 (+20 als vorige wedstrijd laatst gewisseld); sluit GK-slot, vaste keepers (veld én bank) en spelers uit die bij de laatste wisselbeurt net invielen; alleen paren waar de veldspeler ≥1 min méér speelde dan de bankspeler (dus soms minder voorstellen dan bankspelers). Een doorschuiver (`viaId`) die al wisselt of al doorschuift wordt in dat voorstel **gedegradeerd tot een gewone wissel** (`usedVia`, sinds 2.6) — de wissel blijft dus staan, alleen de doorschuif vervalt, zodat de plankaart niet iets belooft dat bij uitvoering stilletjes wegvalt. Niet de hele wissel overslaan: dat kost wissels en verslechtert de speeltijdspreiding meetbaar |
| `executeSub(out, in, slot)` | Voert wissel door (veld/bank/stints/log), snoeit plan; UI-loos |
| `saveSubToPlan()` / `executeAllPlannedSubs()` / `refreshPlan()` | Wisselplan-beheer; plan bevriest zodra coach bewerkt of één wissel uitvoert |
| `getPreviousMatchInfo()` | Rotatie-info uit laatst afgeronde wedstrijd (bankstarters, laatst-gewisselden) |
| `currentMatchMinute()` | Totale wedstrijdminuut incl. eerdere periodes |
| `bestBenchCandidateFor(id)` | Beste bankspeler voor veldpositie (popup "Wisselen" preselecteert deze) |
| `stintColor(pid, onDark)` | Groen→oranje→rood o.b.v. tijd sinds laatste wissel, relatief aan periodeduur |
| `openPlayerStatsModal()` | 📊-knop live: per speler minuten, wisselmomenten (met beurt-nr) en gespeelde posities |
| `renderTimerReminder()` | Toont de rode balk `#timer-reminder` zodra de opstelling bevestigd is en de klok stil staat, en start/stopt de herhaalde toast (elke 30 s, te snoozen per pauze). Wordt vanuit `renderTopBar()` aangeroepen |
| `openRepairModal()` / `renderRepairContent()` | 🔨-knop in de bankbalk (en vanuit de periodemodal): herstelacties in één scherm — klok, periode, doelpunten en wissels |
| `applyRepairTimer()` | Zet de klok en boekt het verschil optioneel bij/af bij de spelers die op dat moment op het veld staan (voor een vergeten gestarte klok) |
| `deleteRepairGoal(i)` / `saveRepairGoal(i)` | Doelpunt verwijderen (stand gaat mee omlaag) of maker/assist wijzigen |
| `undoRepairSub(i)` | Wissel terugdraaien: spelers ruilen terug, `benchStints` −1, `lastSwitchAt` hersteld uit `prevSwitch*` en de speeltijd sinds `atSeconds` gaat van de invaller terug naar de uitgaande speler. Weigert als de invaller niet meer op het veld of de ander niet meer op de bank staat — daarom van nieuw naar oud terugdraaien |
| `applyViaShift(ps)` | Doorschuif-wissel: plan-entry met `viaId` — veldspeler op `slotId` schuift naar het slot van de uitgaande speler, invaller komt op `slotId` (suggestie als positiewinst ≥ 15 pt). In de wisselmodal instelbaar via `sub-via-select` (`onViaChange` vergrendelt dan de positie-select) |
| `startTour()` / `TOUR_STEPS` | Rondleiding met spotlight-overlay; handleiding via ❓-knop (`openHelpModal`) |
| `checkAccess()` / `ACCESS_CODE_HASH` | Toegangscode-gate (SHA-256, localStorage `hockeyCoach_access`); code wijzigen = nieuwe hash in de const |
| `matchPlayers(match)` / `isGuestPlayer(pid)` | Selectie per wedstrijd: vaste spelers + de invallers van díe wedstrijd. Invallers beheer je in het wedstrijdformulier (blok "Invallers", `openGuestModal`/`saveGuest`); `commitMatchGuests(m)` synchroniseert ze bij het opslaan van de wedstrijd. Invaller krijgt 🎽/(inval)-markering in live-weergave en selects |
| `switchTeam()` / `openTeamModal()` | Teamwissel en teambeheer (naam, kleur, spelsysteem, verwijderen) + import/export |
| `teamPositionOptions()` / `posDisplay(pos)` | Spelsysteem-vertaling: voorkeuren blijven opgeslagen in de 11 universele posities (ALL_POSITIONS), maar de voorkeuren-picker, alle voorkeur-weergaves en de CSV-import tonen/accepteren de positielabels van het teamsysteem (slots met dezelfde primaire universele positie samengevoegd, bijv. LCA/RCA → MA). Nieuwe wedstrijden en de typewissel in het wedstrijdformulier vullen het teamsysteem voorin |
| `exportAllData()` / `applyBackup(data)` | Volledige backup als JSON-download; import vervangt alles (met migratie via loadState) |
| `downloadPlayerTemplate()` / `importPlayersFromText(text)` | Spelers-import via CSV (Excel-sjabloon): naam;nummer;posities, `;` of `,`, namen met "voorbeeld" worden overgeslagen, bestaande namen (zelfde team) worden bijgewerkt |
| `endMatch()` | Slaat events op in `m.events`, null-t `state.live` |
| `openMatchDetail(id)` | Toont wedstrijdverslag: opstelling, wissels met positie, speeltijd |
| `showConfirm(msg, fn)` | Custom confirm modal (iOS PWA blokkeert native `confirm()`) |
| `openPlayerPopup(id)` | Toont spelerinfo + bankstints tijdens live wedstrijd |

## UI-structuur
- Views: `#view-matches`, `#view-players`, `#view-live` — matches/players hebben een teambalk (select + ⚙️)
- Live: voortgangsbalk `#period-progress` onder de topbar; veldtokens zijn avatars in teamkleur (rand = linie-kleur, badge = rugnummer); naamkleur = `stintColor`
- Animaties: `.sub-in` (invaller vliegt in), `.just-out` (bankrij), `.score-display.pop`
- Linie-kleuren: GK oranje, DEF blauw, MID paars (`--mid-color: #7d3bbf`), FWD rood
- Modals: `.modal-backdrop` — schuiven van boven (keyboard-safe op mobiel)
- Layout: `height: 100dvh`, `.view-scroll` (flex:1, overflow-y:auto), `.view-footer` (flex-shrink:0)

## Mobiel / iOS
- `confirm()` geblokkeerd in iOS PWA standalone → altijd `showConfirm()` gebruiken
- Touch targets minimaal 44px hoog
- PWA installeerbaar via "Voeg toe aan beginscherm" in Safari

## Taal
Interface is Nederlands.

## Ontwikkelregels
- `APP_VERSION` + `APP_VERSION_DATE` (bovenin het script) bij ELKE wijziging ophogen: minor (+0.1) voor features, major bij grote releases. Zichtbaar in handleiding (❓) en op het codescherm — zo ziet de gebruiker of de nieuwste versie al op Netlify staat
- Geen frameworks, geen externe dependencies
- Alles in één `index.html` (uitzondering: PWA-manifest en iconen)
- Geen comments tenzij de reden niet-voor-de-hand-liggend is
- Geen backwards-compatibility hacks
- Mobiel-first testen (iOS Safari PWA)

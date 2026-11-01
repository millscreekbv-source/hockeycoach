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
- `teams`: `{ id, name, color, formationId, theme?, logo?, keeperMode?, seasonBalance? }` — spelers en wedstrijden hebben een `teamId`; alle lijsten zijn team-gefilterd via `state.currentTeamId`, live-functies via `match.teamId`. `formationId` = spelsysteem van het team (instelbaar in teambeheer, fallback `DEFAULT_FORMATION` via `currentTeamFormationId()`). `color` = avatarkleur van de spelers; `theme` = `{ primary, secondary }` clubkleuren (hex) en `logo` = verkleinde PNG-dataURL (≤ 50.000 tekens, `LOGO_MAX_CHARS`) — zie Clubthema. Beide gaan mee in export/import. `keeperMode` = `''` (voorkeur/vaste keeper) | `'rotate-gk'` | `'rotate-all'`; `duties` = takenlijst voor ouders (zie Taken voor ouders; ontbreekt = `DEFAULT_DUTIES`); `seasonBalance` = seizoenscorrectie aan (standaard, alleen `false` zet uit) — zie Seizoen & keeperrotatie
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
{ id, teamId, date, opponent, homeAway, absentPlayers[], config, keeperId?, events?,
  meetTime?, startTime?, meetPlace?, location?, transport?, hallDuty?, duties? }
// config: { periods, periodSeconds, subIntervalMinutes, type ('veld'|'zaal'), formationId }
// meetTime/startTime: 'HH:MM'; transport: alleen gezet als de coach het vinkje zelf veranderde (anders uit = uit of zaal); hallDuty: zaaldienst (alleen zaal); duties: { dutyId: [playerId] } — zie Taken voor ouders
// keeperId: geplande roulerende keeper (alleen bij keeperMode rotate-*), gekozen in het wedstrijdformulier
// events (na afsluiting): { startingLineup, goals, substitutions, minutesPlayed, benchStints, positionChanges, matchSeconds }
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
  timerLastTickAt,      // Date.now() van de laatst verwerkte seconde: timerTick() telt de échte verstreken tijd (standby/achtergrond pauzeert setInterval)
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
  matchKeeperId,        // roulerende keeper van deze wedstrijd (isFixedKeeper() geeft dan true)
  seasonBalance{},      // playerId → balans in seconden uit eerdere wedstrijden dit seizoen (null = geen correctie)
  matchDurationSecs,    // geplande duur, voor de 10%-grens van de seizoenscorrectie
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
| `getSubSuggestions()` | Wisselvoorstellen: posScore×0.4 + tijdsverschil×4 + stintVerschil×25 (+20 als vorige wedstrijd laatst gewisseld); sluit GK-slot, vaste keepers (veld én bank) en spelers uit die bij de laatste wisselbeurt net invielen; alleen paren waar de veldspeler ≥1 min méér speelde dan de bankspeler (tijden incl. `seasonOffsetSecs()`, sinds 2.9) (dus soms minder voorstellen dan bankspelers). Een doorschuiver (`viaId`) die al wisselt of al doorschuift wordt in dat voorstel **gedegradeerd tot een gewone wissel** (`usedVia`, sinds 2.6) — de wissel blijft dus staan, alleen de doorschuif vervalt, zodat de plankaart niet iets belooft dat bij uitvoering stilletjes wegvalt. Niet de hele wissel overslaan: dat kost wissels en verslechtert de speeltijdspreiding meetbaar |
| `executeSub(out, in, slot)` | Voert wissel door (veld/bank/stints/log), snoeit plan; UI-loos |
| `saveSubToPlan()` / `executeAllPlannedSubs()` / `refreshPlan()` | Wisselplan-beheer; plan bevriest zodra coach bewerkt of één wissel uitvoert |
| `getPreviousMatchInfo()` | Rotatie-info uit laatst afgeronde wedstrijd (bankstarters, laatst-gewisselden) |
| `currentMatchMinute()` | Totale wedstrijdminuut incl. eerdere periodes |
| `bestBenchCandidateFor(id)` | Beste bankspeler voor veldpositie (popup "Wisselen" preselecteert deze) |
| `stintColor(pid, onDark)` | Groen→oranje→rood o.b.v. tijd sinds laatste wissel, relatief aan periodeduur |
| `openPlayerStatsModal()` | 📊-knop live: per speler minuten, wisselmomenten (met beurt-nr) en gespeelde posities |
| `timerTick(simSteps?)` / `catchUpTimer()` | Klok telt verstreken seconden sinds `timerLastTickAt` (niet één per tik), dus ook na standby, achtergrond of herstart van de app; inhalen bij `visibilitychange`, `pageshow`, `focus`, start, periodewissel en afsluiten. **Simulaties:** `timerTick(1)` = precies één seconde |
| `updateWakeLock()` | Houdt het scherm aan zolang de klok loopt (Screen Wake Lock, iOS 16.4+/Android); laat los bij pauze of als de app naar de achtergrond gaat |
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

## Seizoen & keeperrotatie (sinds 2.9)
- Seizoen = augustus t/m juli (`seasonOf(date)` → beginjaar). `seasonStats(teamId, season, excludeMatchId)` rekent per speler: wedstrijden, gespeeld, veldaandeel en **balans** = gespeeld − eerlijk deel, waarbij eerlijk deel = de werkelijk gespeelde veldtijd van die wedstrijd gedeeld door de aanwezige veldspelers (sinds 2.9.1; daarvoor geplande duur × posities / aanwezigen, wat bij een kortere klok iedereen in de min zette). Balansen komen per wedstrijd dus samen op 0 uit. Niet mee in de balans: vaste keepers (`fixedKeeper`, ook als ze even gewisseld zijn) en wie de hele wedstrijd keepte (`matchKeeperId(m)`: GK bij de start en geen wissel op GK). Afwezigen vallen buiten de wedstrijd. Duur voor VELD% = `matchSeconds`, of bij oude wedstrijden alle gespeelde tijd / aantal posities
- Seizoenscorrectie: `startMatch()` zet `live.seasonBalance`; `seasonOffsetSecs(pid)` = (balans − 3 min dode zone) × 0,5, max 10% van de wedstrijdduur. Gebruikt in `getSubSuggestions()`, `bestBenchCandidateFor()` en `autoAssignLineup()` (1 pt per minuut achterstand, max 20, **niet voor het GK-slot**: anders blijft wie achterstaat keepen, want keeperwedstrijden tellen niet in de balans)
- Gemeten (10 wedstrijden, 15 spelers, 4×17,5): aantal wissels gelijk (363/364); spreiding balans 14 → 9 min; met een scheve start (geen wissels in de eerste helft van 3 wedstrijden) 77 → 14 min. Zonder dode zone gaf de correctie bij al eerlijke wedstrijden alleen ruis
- Keeperrotatie: `keeperPool(teamId, absent)` (rotate-all = iedereen, rotate-gk = spelers met GK-voorkeur; vaste keepers en afwezigen niet), `nextKeeperId()` = minste keeperbeurten (gespeeld + eerder ingepland), dan langst geleden. Wedstrijdformulier: `renderKeeperSelect()` (voorstel volgt afwezigen/datum tot de coach zelf kiest: `_keeperManual`). `startMatch()` valt terug op `nextKeeperId()` als de geplande keeper afwezig is
- `isFixedKeeper(pid)` is ook true voor `live.matchKeeperId` — alle keeper-uitsluitingen (wisselvoorstellen, doorschuif, bankkandidaat, auto-opstelling +1000/−500) werken daardoor ook voor de roulerende keeper
- UI: Spelers → 📊 Seizoen (`openSeasonModal`/`renderSeasonContent`), ⚙️ per team: Keeper-select + vinkje seizoensspeeltijd; wedstrijdkaart toont 🧤 geplande keeper
- Simulatie: zie BRIEFING (werkwijze); voor de seizoenslogica meerdere wedstrijden achter elkaar draaien en `seasonStats` vergelijken met en zonder `seasonBalance`

## Clubthema (sinds 2.8)
- Alle themakleuren zijn CSS-variabelen in `:root`; de standaardwaarden zijn het oude groene thema. Geen vaste kleurcodes in CSS-regels zetten, altijd een variabele
  - `--brand` / `--on-brand` (knoppen + tekstkleur), `--brand-press`, `--brand-ink` (merk-tekst op lichte vlakken: h1, scores, badges), `--brand-tint` (licht vlak)
  - `--bar` / `--on-bar` / `--on-bar-rgb` (nav, live-topbar, bankbalk, codescherm; `rgba(var(--on-bar-rgb), x)` voor halfdoorzichtige tekst/knoppen, class `.bar-btn`), `--bar-deep` (voortgangsbalk), `--accent`, `--timer-run`
  - `--pitch` / `--pitch-stripe` / `--pitch-edge` = het hockeyveld; bewust níét afgeleid van de clubkleur (veldtokens en stintkleuren moeten leesbaar blijven)
- `deriveTheme(primary, secondary)` leidt alle variabelen af met WCAG-contrastcontrole (`contrastRatio`): tekst ≥ 4,5:1 op knoppen, balken en lichte vlakken. Lichte clubkleur → donkere tekst (`#1a1a1a`); lukt dat niet → donkerdere knopvariant (`darkenUntil`). Bijna-witte primaire kleur wordt met de secundaire omgewisseld. Accent = een verzadigde clubkleur als die 4,5:1 haalt op de balk, anders `#f0a500`, anders `--on-bar`
- `applyTheme()` zet de variabelen op `document.documentElement` (of haalt ze weg = standaard), werkt `meta theme-color` bij en toont de logo's (`.team-logo` in de teambalken, `#live-logo` in de live-topbar). Wordt aangeroepen vanuit `renderTeamBar()`, `switchTab()` en `renderLiveView()`
- `themeTeam()`: in de live-view het team van de lopende wedstrijd (`match.teamId`), anders `state.currentTeamId`
- Teambeheer → blok Clubthema (`teamThemeHtml`): `uploadTeamLogo()` verkleint het logo (`shrinkLogo`: 160→56 px tot het onder `LOGO_MAX_CHARS` blijft) en stelt kleuren voor via `dominantColors()` (canvas, 4096 kleurbakjes, transparant/wit/zwart/grijs overgeslagen; tweede kleur moet duidelijk afwijken). Handmatig aanpasbaar (`updateTeamTheme`), omwisselen (`swapTeamTheme`), terug naar standaard (`resetTeamTheme`), logo weg (`removeTeamLogo`). Mini-voorbeeld + uitleg over de contrastaanpassing in het blok. Clublogo's zijn merkrecht: de coach/club levert het logo zelf aan

## Taken voor ouders: rij-/fruitschema en weekbericht (sinds 2.11)
- Wedstrijdformulier: verzamelen, aanvang, verzamelplek, locatie, **Vervoer nodig** (standaard aan bij uit of zaal; `_transportManual` zodra de coach het vinkje aanraakt → dan `match.transport` opgeslagen) en **Zaaldienst** (alleen bij zaal). `fillMatchPractical()` / `readMatchPractical()` / `updatePracticalDefaults()`
- `team.duties` (anders `DEFAULT_DUTIES`): `{ id, name, emoji, count, when, sameAs? }`, `when` = all | home | away | transport | hall (`dutyApplies`). Standaard: rijden 4 (transport), fruit 1 (all), fluiten 2, scores bijhouden 2 en balken plaatsen/afruimen = dezelfde ouders als rijden (hall). `sameAs` volgt de bron (`dutyFollows`), maar krijgt eigen ouders (aantal = bron) als de bron bij die wedstrijd niet nodig is
- `refreshDuties(m, reset)`: houdt bestaande (geruilde) indeling, haalt afwezigen eruit en vult aan met wie de taak dit seizoen het minst deed (`dutyHistory`, telt gespeelde én geplande wedstrijden), daarna langst geleden, daarna `dutyTieBreak` (hash van wedstrijd + speler, zodat niet steeds rugnummer 1 vooraan staat). Liefst geen twee taken voor één gezin per wedstrijd (`busy`). Invallers en afwezigen nooit. Aangeroepen bij opslaan van een (niet-afgelopen) wedstrijd en na wijzigen van de takenlijst (`afterDutySettingsChange`)
- UI: knop **🚗 Taken** op de wedstrijdkaart → `openDutiesModal()` (per plek een select "Ouders van …", ruilen via `setDutySlot` wisselt van plek als de gekozen ouder al ingedeeld was; 🔄 Opnieuw verdelen; 📊 Verdeling dit seizoen; ⚙️ Taken instellen). Kaart toont `practicalLineHtml()`
- Weekbericht: kaart **Deze week** bovenaan de wedstrijdlijst (`weekCardHtml`, niet-afgelopen wedstrijden van vandaag t/m 6 dagen verder) → `openWeekMsgModal(ids)` met bewerkbare tekst uit `buildParentMessage()` (WhatsApp-opmaak met *vet*, routelink Google Maps, taken, afwezigen). Delen: `wa.me/?text=` of kopiëren
- Tijden en locaties vult de coach nu zelf in. Automatisch ophalen uit de KNHB-gegevens (Hockeyweerelt) kan pas na afstemming met KNHB/Hockeyweerelt: er is geen gedocumenteerde openbare API (zie STATUS)
- Getest: 20 wedstrijden met wisselende afwezigen en zaaldienst → per taak spreiding hooguit 1 beurt, nooit een afwezige, nooit twee taken per gezin, balken = rijders

## Wedstrijdprogramma: overzicht en (slapende) koppeling (sinds 2.12)
- **📅 Programma** naast de kop Wedstrijden → `openProgramModal()` / `renderProgramContent()`: alle niet-afgelopen wedstrijden per maand met tijden, locatie, veld, scheidsrechter, opmerkingen en taken; tik = `openDutiesModal`; 💬 Delen = `buildParentMessage` van alle komende. Wedstrijdlijst: komende oplopend bovenaan, gespeelde aflopend eronder
- Koppeling met een clubprogramma is gebouwd maar staat **uit** (`PROGRAM_CLUBS = []`): er is nog geen toegestane bron. Zie STATUS (Shinty-site: Cloudflare 403 voor Netlify; KNHB `app.hockeyweerelt.nl`: alleen voor knhb.nl, gebruiksvoorwaarden art. 3.2 d/e verbieden omzeilen; LISA: alleen via officiële API van de club of een agenda-feed). Niet omzeilen
- Werking als hij aan staat: ⚙️ → Wedstrijdprogramma (`teamProgramHtml`, `loadProgramTeams`, `linkProgram`), `team.program = { club, team, lastSync, ignored[] }`. `syncProgram(teamId, silent)` maakt/werkt wedstrijden bij op `match.extId` (`applyProgramItem`): datum, tegenstander, thuis/uit, aanvang, verzamelen, locatie (+`locationName`, `geo`), veld, scheidsrechters, opmerkingen, afgelast. Wat de coach zelf aanpaste (`match.manual`, gezet in `readMatchPractical`) blijft staan. Verwijderd = `program.ignored`. Niet meer in de feed en nog toekomstig = afgelast-markering. Daarna keeper (`nextKeeperId`) en taken in datumvolgorde. `autoSyncProgram()` bij start, teamwissel en terug naar Wedstrijden, hooguit eens per uur. Nieuwe wedstrijd krijgt de config van de laatste wedstrijd van hetzelfde type, anders spelsysteem + KNHB-preset op leeftijd (`programMatchConfig`)
- Bron = Netlify-functie `netlify/functions/programma.mjs` (`PROGRAM_API`). Deploy dan mét `--functions <repo>/netlify/functions`; zonder die vlag (vanuit een tijdelijke map) gaat de functie níet mee
- `match.cancelled` → kaart doorgestreept + badge, geen taken, niet in het weekbericht-kaartje

## Spelregels (sinds 2.13)
- Tabblad **Regels** (`#view-rules`, `nav-rules`) → `renderRules()`. Veld/Zaal-schakelaar (`setRulesType`, onthouden in localStorage `hockeyCoach_rulesType`, anders het type van het teamsysteem), zoekveld, veelgestelde vragen, onderwerpen (inklapbaar) en alle vragen
- Inhoud: `const RULES = { veld, zaal }` in `index.html`, elk `{ bron: { titel, url }, onderwerpen: [{ id, titel, emoji, kort, punten[], artikelen, trefwoorden[] }], vragen: [{ vraag, antwoord, artikelen, onderwerp }] }`. **Eigen samenvatting** (auteursrecht KNHB: geen letterlijke zinnen) van *Spelreglement veld vanaf 1 augustus 2026* (18 onderwerpen, 35 vragen, incl. jongste jeugd uit de KNHB-pagina en de speelregelbladen O7–O10) en *Spelreglement zaal vanaf 1 november 2025* (16 onderwerpen, 30 vragen). Gemaakt op 1-11-2026, steekproefsgewijs nagekeken tegen de tekst. **Nieuw reglement (meestal 1 augustus veld, november zaal)** → samenvatting bijwerken
- Zoeken zonder AI: `rulesTokens` (kleine letters, accenten weg, stopwoorden weg) en `rulesScore` (trefwoorden/vraag/titel wegen zwaarder dan de uitleg; ook begin-van-woord). Bovenste antwoord staat open, zoekwoorden gemarkeerd (`rulesHighlight`)
- Vragen stellen aan een AI-assistent is nog niet gebouwd: kost geld per vraag, dus eerst een besluit over beveiliging (inlog of toegangscode op de server + bestedingslimiet)

## Installeren op beginscherm (sinds 2.10)
- Balk `#install-hint` (in `#app`, `order: 5`, tussen view en nav) via `renderInstallHint()`; aangeroepen bij de start en vanuit `switchTab()`. Nooit tijdens de live-view
- Niet geïnstalleerd (`isStandalone()` false) op iPhone/Android (`installPlatform()`): "Zet de app op je beginscherm" met **Hoe?** (uitlegvenster `openInstallModal()`) of, als Chrome een `beforeinstallprompt` gaf, **Installeren** (`runInstallPrompt()`). **Later** = 7 dagen weg, "Herinnering niet meer tonen" = altijd weg (localStorage `hockeyCoach_installHint`: tijdstip of `'never'`); `appinstalled` zet hem ook uit
- **iPhone: de app op het beginscherm heeft een eigen localStorage, los van Safari.** Heeft de coach al gegevens in Safari, dan begint het uitlegvenster met "eerst backup maken" (`exportAllData()`) en daarna importeren in de beginscherm-app. In de beginscherm-app zonder eigen gegevens verschijnt één keer "Eerder in Safari gewerkt? → ⚙️ Importeren" (`hockeyCoach_installHint_import`)
- Er is geen service worker; Chrome/Android kan dan geen `beforeinstallprompt` geven — het uitlegvenster met de menustappen is de terugval
- Handleiding (❓) sectie 0 linkt naar het uitlegvenster
- Testen: `installPlatform`/`isStandalone` zijn gewone functies en in de console te overschrijven (`installPlatform = () => 'ios'`); een nep-`beforeinstallprompt` (Event met `prompt()` en `userChoice`) test de installeerknop

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

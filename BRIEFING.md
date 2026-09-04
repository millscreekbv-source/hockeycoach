# BRIEFING — Hockey Coach App

Voor een Claude-sessie die dit project nog niet kent.

## Wat is dit
Single-file PWA (Nederlands) voor hockeycoaches: spelers, wedstrijden en live wissels beheren, met eerlijke speeltijdverdeling als kern. Gebruiker: Auke, coacht zelf een jeugdteam (veldhockey, meisjes). Live op **hockey-coach.online**, toegangscode **Shinty-app**.

## Lees eerst
**Alle technische documentatie staat in `AGENTS.md`** (identiek aan `CLAUDE.md`): bestandsstructuur, state, formaties, belangrijke functies, UI-regels en ontwikkelregels. Die is leidend — hier niet herhaald. Kernregels:
- Alles in één `index.html`, geen frameworks/dependencies.
- `APP_VERSION` + `APP_VERSION_DATE` bij élke wijziging ophogen.
- Na elke wijziging `netlify-upload/` opnieuw vullen (cp-commando staat in AGENTS.md); Auke sleept die map zelf naar Netlify.
- iOS PWA: nooit native `confirm()`, altijd `showConfirm()`.

## Werkwijze in dit project
- Testen kan via de browser-preview; wedstrijdscenario's zijn goed te simuleren via de console/`javascript_tool` (state direct manipuleren, `timerTick()` in een lus aanroepen, `renderBench()` + `executeAllPlannedSubs()` per wisselbeurt, `endMatch()` + klik op `confirm-ok-btn`). Dat heeft eerder echte bugs gevonden — bij wijzigingen aan wissellogica altijd een versnelde simulatie draaien en per minuut controleren: 11 unieke spelers, unieke slots, niemand op veld én bank.
- Toegangscode in de testbrowser omzeilen: `localStorage.setItem('hockeyCoach_access', ACCESS_CODE_HASH)` en herladen. Testdata daarna wissen met `localStorage.removeItem('hockeyCoach_v3')`.
- Preview-server: `preview_start` leest `.claude/launch.json` uit de **werkmap van de sessie** (niet uit deze projectmap). Draait de sessie vanuit een andere map, zet dan daar een configuratie neer met `npx --yes serve "<pad naar hockey-coach>" -l 8642`. `python3 -m http.server` faalt in de sandbox (PermissionError op getcwd).
- Auke test zelf op iPhone (Safari PWA) en stuurt screenshots bij rare situaties; wisselminuten en beurten in 📊 Overzicht maken die goed herleidbaar.
- Bij icoonwijzigingen: iOS ververst een beginschermicoon nooit — tegel verwijderen wist ook localStorage-data, dus altijd eerst laten exporteren (⚙️ → Exporteren).

## Valkuilen
- Vaste keeper: `player.fixedKeeper` (sinds 2.5). Alle keeper-uitsluitingen lopen via `isFixedKeeper()`/`p.fixedKeeper` én via `slotId !== 'GK'` — allebei laten staan, ze dekken verschillende situaties (keeper op de bank vs. willekeurige speler in het doel).
- Wissellogica is het gevoeligste deel: voorstellen, wisselplan en doorschuifwissels grijpen op elkaar in. Historie: v2.1–v2.3 waren alle drie bugfixes in dit samenspel; v2.5 voegde de vaste keeper toe. Test na wijziging altijd: plan met meerdere wissels tegelijk uitvoeren, doorschuif gekoppeld aan een net-gewisselde speler, en de ≥1-minuut-drempel.
- Git wordt niet automatisch bijgehouden — check of de werkstand gecommit is (repo: millscreekbv-source/hockeycoach).

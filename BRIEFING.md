# BRIEFING — Hockey Coach App

Voor een Claude-sessie die dit project nog niet kent.

## Wat is dit
Single-file PWA (Nederlands) voor hockeycoaches: spelers, wedstrijden en live wissels beheren, met eerlijke speeltijdverdeling als kern. Gebruiker: Auke, coacht zelf een jeugdteam (veldhockey, meisjes). Live op **hockey-coach.online**, toegangscode **Shinty-app**.

## Lees eerst
**Alle technische documentatie staat in `AGENTS.md`** (identiek aan `CLAUDE.md`): bestandsstructuur, state, formaties, belangrijke functies, UI-regels en ontwikkelregels. Die is leidend — hier niet herhaald. Kernregels:
- Alles in één `index.html`, geen frameworks/dependencies.
- `APP_VERSION` + `APP_VERSION_DATE` bij élke wijziging ophogen.
- Na elke wijziging `netlify-upload/` opnieuw vullen (cp-commando staat in AGENTS.md) en publiceren met de Netlify CLI — die staat op de MacBook Air al ingelogd als Auke, dus publiceren kan Claude zelf (commando in AGENTS.md onder Publicatie). Sinds 25-09 gaat het zo; daarvóór sleepte Auke de map handmatig naar Netlify.
- iOS PWA: nooit native `confirm()`, altijd `showConfirm()`.

## Werkwijze in dit project
- Testen kan via de browser-preview; wedstrijdscenario's zijn goed te simuleren via de console/`javascript_tool` (state direct manipuleren, `timerTick()` in een lus aanroepen, `renderBench()` + `executeAllPlannedSubs()` per wisselbeurt, `endMatch()` + klik op `confirm-ok-btn`). Dat heeft eerder echte bugs gevonden — bij wijzigingen aan wissellogica altijd een versnelde simulatie draaien en per minuut controleren: 11 unieke spelers, unieke slots, niemand op veld én bank.
- Toegangscode in de testbrowser omzeilen: `localStorage.setItem('hockeyCoach_access', ACCESS_CODE_HASH)` en herladen. Testdata daarna wissen met `localStorage.removeItem('hockeyCoach_v3')`.
- Preview-server: `preview_start` leest `.claude/launch.json` uit de **werkmap waarmee de sessie begon**, ook nadat de werkmap naar deze projectmap is verplaatst. Zet die configuratie dus neer in de oorspronkelijke sessiemap, met `npx --yes serve "<pad naar hockey-coach>" -l 8642` en een absoluut pad. `python3 -m http.server` faalt in de sandbox (PermissionError op getcwd). `npx serve` heeft de eerste keer ~20 seconden nodig; wacht met een `until curl -s -o /dev/null http://localhost:8642/index.html; do sleep 1; done` in plaats van meteen te navigeren.
- Schermafbeeldingen lopen een frame achter: na een klik die een modal opent, maak twee screenshots achter elkaar (of één extra los) — de eerste toont nog het scherm van ervoor.
- Auke test zelf op iPhone (Safari PWA) en stuurt screenshots bij rare situaties; wisselminuten en beurten in 📊 Overzicht maken die goed herleidbaar.
- Bij icoonwijzigingen: iOS ververst een beginschermicoon nooit — tegel verwijderen wist ook localStorage-data, dus altijd eerst laten exporteren (⚙️ → Exporteren).

## Valkuilen
- Herstelacties (sinds 2.6): de herstelmodal rekent speeltijd terug, dus `executeSub()` móét `atSeconds`, `prevSwitchOut` en `prevSwitchIn` blijven vastleggen. Verandert er iets aan `executeSub()` of aan `lastSwitchAt`, loop dan `undoRepairSub()` na.
- Vaste keeper: `player.fixedKeeper` (sinds 2.5). Alle keeper-uitsluitingen lopen via `isFixedKeeper()`/`p.fixedKeeper` én via `slotId !== 'GK'` — allebei laten staan, ze dekken verschillende situaties (keeper op de bank vs. willekeurige speler in het doel).
- Wissellogica is het gevoeligste deel: voorstellen, wisselplan en doorschuifwissels grijpen op elkaar in. Historie: v2.1–v2.3 waren alle drie bugfixes in dit samenspel; v2.5 voegde de vaste keeper toe. Test na wijziging altijd: plan met meerdere wissels tegelijk uitvoeren, doorschuif gekoppeld aan een net-gewisselde speler, en de ≥1-minuut-drempel.
- **Meet een voorgestelde oplossing voordat je hem overneemt.** Het doorschuifpunt van 2.5 had een uitgeschreven oplossing in STATUS.md ("viaId's meenemen in `usedField`"). Die werkte, maar kostte 10 van de 40 wissels en verdubbelde de spreiding in speeltijd. De betere variant laat de wissel staan en degradeert alleen de doorschuif. Bij wijzigingen aan de wissellogica: draai de simulatie voor beide varianten naast elkaar en kijk niet alleen naar "is de bug weg", maar ook naar aantal wissels en min/max speeltijd.
- **Git wordt niet automatisch bijgehouden** — check of de werkstand gecommit is (repo: millscreekbv-source/hockeycoach). Let op: git via de Drive-mount kan zijn eigen refs slopen. Omdat verwijderen op de mount niet mag, blijft na een commit `.git/refs/heads/main.lock` staan terwijl `refs/heads/main` zelf nooit wordt aangemaakt; `git status` zegt dan "No commits yet" terwijl de objecten en de reflog er gewoon zijn. Controleer na elk git-commando `find .git -name "*.lock"`, en herstel met `cp .git/refs/heads/main.lock .git/refs/heads/main` (idem voor `refs/remotes/origin/main`) gevolgd door het verwijderen van de lock-bestanden. Beter: alleen `git add` doen en Auke zelf laten committen en pushen vanuit zijn eigen Terminal.

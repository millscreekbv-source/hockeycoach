# STATUS — Hockey Coach App

Laatst bijgewerkt: 2026-11-01

## Huidige stand (1 november 2026)
- **Versie 2.10 staat live** (1-11, hulp bij installeren op het beginscherm; zie hieronder). Daarvoor dezelfde dag:
- **Versie 2.9.1 live gezet op hockey-coach.online** (1-11-2026, Netlify CLI vanaf de Mac mini, gecontroleerd met `cmp`: de live pagina is gelijk aan `netlify-upload/index.html`). Daarin zitten 2.8 (clubthema), 2.9 (seizoensspeeltijd + keeperrotatie) en de balansreparatie van 2.9.1.
- Git: 2.8 t/m 2.9.1 gecommit op `main` (Mac mini). Pushen naar GitHub doet Auke zelf (`git push origin main` in `~/Projecten/hockeycoach`): Claude mag vanuit deze sessie niet pushen. Controle: `git status` zegt "up to date with origin/main".
- Toegangscode van de app: **Shinty-app**.
- Plan voor de betaalde versie: `PLAN-BETAALDE-APP.md`; marketing richting clubs in `marketing/` (mailreeks, antwoordflow, 70 clubs in `leads.csv`, van de ±320 in Nederland) — nog niets verstuurd.
- De parallelle sessies van 22-10 (wedstrijdschema importeren, meerdere coaches via Supabase) hebben **niets achtergelaten**: geen worktree, geen branch, lokaal noch op GitHub. Opnieuw oppakken.

## Wensenlijst (1-11-2026, volgorde nog te kiezen met Auke)
1. ~~**App op het beginscherm**~~ — **gedaan in 2.10.** Hulp bij installeren (iOS: uitleg via Deel → Zet op beginscherm; Android: installeerknop). Belangrijk omdat Safari localStorage van een gewone webpagina na 7 dagen niet gebruiken kan wissen.
2. **Rij-/fruitschema + wekelijks WhatsApp-bericht voor ouders** — tijden en locaties van de officiële hockeysite (welke pagina, en of uitlezen mag, nog uitzoeken; uitlezen moet via een Netlify-functie).
3. **Spelregel-uitleg veld en zaal** — per onderwerp (kan zonder kosten in de app) plus snel vragen stellen (Claude-API = kosten per vraag → echte inlogcontrole nodig).
4. **Delen met andere coaches van het team** — Fase 1 van PLAN-BETAALDE-APP.md (accounts + Supabase). Valt samen met de inlog die punt 3 nodig heeft.
5. **Marketing richting clubs** — `marketing/`; prijs en pilotvoordeel kiest Auke.

## Gedaan op 1 november 2026 — versie 2.10
- **Hulp bij installeren op het beginscherm.** Balk onderin (niet tijdens live): "Zet de app op je beginscherm" met Hoe? / Installeren (Android, als Chrome het aanbiedt) en Later (7 dagen); in het uitlegvenster "Herinnering niet meer tonen". Stappen per toestel (iPhone: Deel → Zet op beginscherm → Voeg toe; Android: ⋮ → App installeren). Handleiding sectie 0.
- iPhone: de beginscherm-app heeft een eigen geheugen, los van Safari. Met gegevens in Safari begint de uitleg met "Backup maken" + importeren; een lege beginscherm-app toont één keer "Eerder in Safari gewerkt? → ⚙️ Importeren". Auke koos ervoor die waarschuwing te laten staan.
- Getest in de browser (375 px): Android met nep-installeerprompt, iPhone met/zonder gegevens, beginscherm-modus, Later/nooit, verborgen in live, geen consolefouten. Niet op een echte iPhone getest.
- Idee voor later: een service worker geeft Android een echte installeerknop en laat de app zonder internet openen — wijkt af van de regel "alleen index.html + manifest + iconen".

## Gedaan op 1 november 2026 — versie 2.9.1
- Auke testte 2.9 met zijn eigen wedstrijden: in 📊 Seizoen stond bijna iedereen in de min (samen ±700 min), alleen de keeper in de plus. Oorzaak: het eerlijke deel werd berekend uit de **geplande** duur (4×17,5 = 70 min); wedstrijden van vóór 2.9 hebben geen `matchSeconds`, en de klok liep in werkelijkheid korter. Daarnaast telde een vaste keeper mee in een wedstrijd waarin hij één keer gewisseld was.
- Reparatie in `seasonStats()`: eerlijk deel = werkelijk gespeelde veldtijd gedeeld door de aanwezige veldspelers; vaste keepers tellen nooit mee in de balans (ook niet als ze even gewisseld zijn); werkelijke duur voor VELD% = `matchSeconds`, of anders alle gespeelde tijd / aantal posities. De balansen komen per wedstrijd samen op 0 uit.
- Kolom "BAL" heet nu "+/− MIN", met aangepaste uitleg.
- Getest: drie nagebootste wedstrijden (kortere klok, vaste keeper 5 min gewisseld, één afwezige): som van de balansen per wedstrijd en over het seizoen = 0, vaste keeper "—", geen consolefouten. Bij met 2.9 gespeelde wedstrijden met een volle bezetting is de uitkomst wiskundig gelijk aan voorheen, dus de wisselsimulaties van 2.9 blijven gelden.
- Afwezigen tellen niet mee (zo was het al): wie bij een wedstrijd als afwezig staat, valt voor die wedstrijd buiten de balans. Wie níet als afwezig is aangevinkt maar er niet was, krijgt 0 minuten en dus een onterechte min.

## Gedaan op 22 oktober 2026 — versie 2.9
- **Speeltijd over het seizoen**: Spelers → 📊 Seizoen toont per speler wedstrijden, veldaandeel, balans (± minuten t.o.v. eerlijk deel) en keeperbeurten. Opstelling en wisselvoorstellen compenseren een achterstand (max 10% per wedstrijd, verschillen < 3 min genegeerd). Uit te zetten per team.
- **Keeperrotatie**: per team instelbaar (rouleren: iedereen / spelers met keeper als voorkeur). Het wedstrijdformulier stelt voor wie aan de beurt is; die keept de hele wedstrijd en zit niet in de wisselvoorstellen.
- `endMatch()` bewaart nu ook `benchStints`, `positionChanges` en `matchSeconds` (open punt opgelost).
- Getest: headless simulaties van 10 wedstrijden per variant (geen rotatie / rotate-all / rotate-gk, correctie aan/uit, met en zonder scheve start): elke minuut 11 unieke spelers, unieke slots, niemand op veld én bank, roulerende keeper altijd in het doel: **0 bevindingen, 0 JS-fouten**. Resultaten in CLAUDE.md. Schermen gecontroleerd op 375 px. Nog niet op een echte iPhone.
- App staat op **versie 2.7** (26 september 2026) en is **live op hockey-coach.online** — gepubliceerd op 26-09 met de Netlify CLI vanaf de Mac mini (CLI daar ook ingelogd als Auke), geverifieerd via curl: de live pagina bevat versie 2.7.
- **Publiceren kan voortaan door Claude zelf.** De Netlify CLI staat op de MacBook Air ingelogd als Auke (a.meulenbroek@real-connect.nl); het deploy-commando en de site-id staan in AGENTS.md onder Publicatie. Handmatig slepen hoeft niet meer.
- Toegangscode van de app: **Shinty-app**.
- App is functioneel compleet en getest: teams, formaties (veld/zaal/jongste jeugd), auto-opstelling met rotatie, wisselvoorstellen + wisselplan, doorschuifwissels, live timer, klok-herinnering, herstelacties, wedstrijdverslag, CSV-import, backup/export, rondleiding, vaste keeper.

## Git-repo hersteld
De lock-bestanden uit de sectie hierboven (4 sept) zijn opgeruimd; git werkt weer normaal. Versies 2.6 en 2.7 zijn op 26-09 gecommit en gepusht naar GitHub.

## Gedaan op 25 september 2026 — versie 2.6
- **Doorschuifpunt uit de vorige sessie opgelost, maar anders dan voorgesteld.** De voorgestelde oplossing (viaId's meenemen in `usedField`) is gebouwd én gemeten, en bleek duurder dan gedacht: de doorschuiver werd dan helemaal geblokkeerd, wat wissels kost. Gemeten over vier simulaties van 4×17,5 min:
  | variant | wissels (14 sp.) | spreiding (14 sp.) | wissels (16 sp.) | spreiding (16 sp.) | vervallen doorschuiven |
  |---|---|---|---|---|---|
  | oud (2.5) | 22 | 6 min | 40 | 6 min | 2 resp. 4 |
  | viaId in `usedField` | 20 | **16 min** | 30 | **11 min** | 0 |
  | **gekozen: doorschuif degraderen** | 22 | 6 min | 40 | 6 min | 0 |
  De gekozen oplossing laat de wissel staan en laat alleen de dóórschuif vervallen (`usedVia` + `basePosScore` in `getSubSuggestions`). Zo belooft de plankaart nooit meer iets dat bij uitvoering wegvalt, zonder dat het wissels of eerlijke speeltijd kost.
- **Klok-herinnering.** Staat de klok stil terwijl de opstelling bevestigd is, dan verschijnt een rode, pulserende balk onder de topbar ("⏸ Klok staat stil — tik om te starten", de hele balk is de startknop) én elke 30 seconden een melding. Met ✕ op de balk zet je de meldingen stil voor die pauze; de balk blijft. Verschijnt dus automatisch na elke periodewissel.
- **Herstelacties (🔨).** Nieuwe knop in de bankbalk, ook bereikbaar via Periode → Herstellen. Drie blokken:
  - **Klok & periode** — tijd instellen met een vinkje "speeltijd van de spelers op het veld meerekenen" (voor een vergeten gestarte klok), en een periode terug (de klokstand van vóór de periodewissel wordt bewaard in `lastPeriodEndSeconds`).
  - **Doelpunten** — afgekeurd doelpunt verwijderen (stand gaat mee omlaag, ook voor tegendoelpunten) of de maker/assist wijzigen.
  - **Wissels** — een wissel terugdraaien: spelers ruilen terug, de wisselbeurt gaat eraf, `lastSwitchAt` wordt hersteld en de speeltijd sinds die wissel gaat van de invaller terug naar de uitgaande speler. Daarvoor legt `executeSub()` nu `atSeconds`, `prevSwitchOut` en `prevSwitchIn` vast. Terugdraaien gaat van nieuw naar oud; de app weigert netjes als dat niet kan.
- De halve handmatige correcties in de periodemodal ("Timer handmatig instellen", "Score aanpassen") zijn eruit: die pasten alleen het getal aan en lieten de doelpuntenlijst en de speeltijden scheef staan. Vervangen door één knop naar de herstelmodal.
- Handleiding (❓) en rondleiding aangevuld; `CLAUDE.md`/`AGENTS.md` bijgewerkt met de nieuwe state-velden en functies.

## Getest op 25 september 2026
- Vier versnelde wedstrijdsimulaties (4×17,5 min; 14/16/18 spelers; wisselbeurt per 5, 6 en 8 min). Elke minuut gecontroleerd: 11 spelers op het veld, geen dubbele speler, geen dubbel slot, niemand tegelijk op veld én bank, keeper altijd in het doel. **0 bevindingen**, 0 vervallen doorschuiven, keeper 70' en nooit in een wisselvoorstel.
- Herstelacties per stuk nagerekend: doelpunt bewerken en verwijderen (stand en topbar volgen mee), wissel terugdraaien (veld, bank, `benchStints`, `lastSwitchAt` en minuten exact terug; som van alle speelminuten bleef 11 × wedstrijdtijd), klok vooruit mét en zonder meerekenen, periode terug.
- Klik-doorloop op iPhone-formaat (375×812) door de hele keten: +Doel → 🔨 → ✏️ → 🗑️ → bevestigen. Modals stapelen goed, knoppen zijn raakbaar, de herinneringsbalk verschijnt en verdwijnt zoals bedoeld.

## Gedaan op 26 september 2026 — versie 2.7 gepubliceerd
- Auke meldde dat de app nog versie 2.6 toonde en dat invallers toevoegen niet lukte. Oorzaak: de sessie die 2.7 bouwde (invallers per wedstrijd) is gestopt vóór publicatie — `netlify-upload/` bevatte nog 2.6 en STATUS/AGENTS wisten nog van niets.
- **Versie 2.7 — invallers per wedstrijd** alsnog getest en gepubliceerd. In het wedstrijdformulier staat een blok "Invallers" (+ Invaller toevoegen): naam, nummer, voorkeursposities, evt. vaste keeper. Invallers horen bij één wedstrijd (`guestForMatchId`), staan niet in de vaste spelerslijst, tellen overal mee in die wedstrijd (opstelling, bank, wisselvoorstellen, 🎽-markering) en verdwijnen met de wedstrijd.
- Getest in de browser: invallers aanmaken/chips in het formulier, gast-vaste-keeper automatisch op GK, invaller in wisselvoorstel en wissel uitgevoerd, wedstrijd verwijderen ruimt gasten op, vaste selectie blijft intact.
- Docs bijgewerkt (AGENTS/CLAUDE/STATUS/OVERZICHT); 2.6 + 2.7 gecommit en gepusht.

## Gedaan op 22 oktober 2026 — versie 2.8 clubthema
Eerste zichtbare stap richting de betaalde app (zie PLAN-BETAALDE-APP.md): de app in de eigen clubkleuren. Werkt lokaal, zonder backend; later de basis voor het clubthema bij de clublicentie.
- **Alle vaste groentinten uit de CSS** naar variabelen in `:root` (`--brand`, `--bar`, `--brand-ink`, `--brand-tint`, `--accent`, …). Het hockeyveld heeft eigen variabelen (`--pitch*`) en blijft groen.
- **Teambeheer → Clubthema**: clublogo uploaden (verkleind tot max. 50 KB, opgeslagen in het team), de app stelt de primaire/secundaire kleur voor uit het logo (canvas, wit/zwart/grijs/transparant overgeslagen). Kleuren handmatig aan te passen, om te wisselen of terug naar standaard. Live voorbeeld van balk + knop in het blok.
- **Contrast (WCAG AA, 4,5:1)**: bij lichte clubkleuren automatisch donkere tekst, anders een donkerdere knopvariant. Ook `meta theme-color` (statusbalk) volgt het thema.
- Thema volgt het geselecteerde team; in de live-weergave het team van de lopende wedstrijd. Logo klein in de teambalk en de live-topbar.
- Handleiding (❓) uitgebreid met punt 8 Clubthema; CLAUDE.md/AGENTS.md bijgewerkt.

## Getest op 22 oktober 2026 (Chrome, telefoonbreedte)
- Geel/wit logo → geel thema met donkere tekst (contrast knop/balk 11,9:1, merktekst 5,3:1). Donker logo (marine/rood) → marine thema met witte tekst (≥ 14:1).
- Contrastcontrole doorgerekend voor o.a. wit/wit, felgroen/geel, grijs, lichtblauw, middenrood, olijf: alle tekstcombinaties ≥ 4,5:1.
- Teamwissel geel ↔ marine wisselt thema, logo en theme-color; live-weergave houdt het thema van het wedstrijdteam, ook als in de tussentijd een ander team geselecteerd is.
- Backup-route (bestand → importeren → bevestigen) en herladen van de pagina: thema en logo's blijven behouden. Groot foto-achtig logo (2 MB) werd 30 KB. Geen consolefouten.
- Niet getest op een echte iPhone/Safari — graag even controleren na publicatie.

## Open punten
- Het wedstrijdverslag toont de positiewissels nog niet (de data staat sinds 2.9 wel in `m.events.positionChanges`).
- Feedback uit echte wedstrijden afwachten (seizoen loopt).

## Eerstvolgende actie
Auke: app op de iPhone opnieuw openen (codescherm: **Versie 2.10**). Volgende wensen: rij-/fruitschema + WhatsApp-bericht, spelregel-uitleg, delen met coaches.

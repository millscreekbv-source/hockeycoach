# STATUS — Hockey Coach App

Laatst bijgewerkt: 2026-09-26

## Huidige stand
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

## Open punten
- `endMatch()` slaat `positionChanges` en `benchStints` niet op in `m.events` — het wedstrijdverslag mist daardoor de positiewissels. Klein, niet urgent.
- Feedback uit echte wedstrijden afwachten (seizoen loopt).

## Eerstvolgende actie
Auke: app volledig afsluiten (appkiezer → wegvegen) en opnieuw openen; codescherm moet **Versie 2.7** tonen. Daarna invallers uitproberen via wedstrijd → Invallers → + Invaller toevoegen.

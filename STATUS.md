# STATUS — Hockey Coach App

Laatst bijgewerkt: 2026-08-29 (2e sessie)

## Huidige stand
- App staat op **versie 2.4** (29 augustus 2026) in de projectmap; live staat mogelijk nog 2.3 — v2.4 moet nog naar Netlify gesleept worden.
- Toegangscode van de app: **Shinty-app**.
- App is functioneel compleet en getest: teams, formaties (veld/zaal/jongste jeugd), auto-opstelling met rotatie, wisselvoorstellen + wisselplan, doorschuifwissels, live timer, wedstrijdverslag, CSV-import, backup/export, rondleiding.
- Volledige wedstrijdsimulatie (4×17,5 min, wissels om de ~8 min, incl. blessure- en tactische ingrepen) uitgevoerd op 4 juli: speeltijdverdeling eerlijk (gem. exact op theoretisch gemiddelde), veld bleef compleet.

## Gedaan in laatste werksessie (4 juli 2026)
- Versienummer zichtbaar gemaakt in app (codescherm + handleiding), start bij 2.0.
- Nieuw beginschermicoon: veldhockeystick i.p.v. ijshockeystick (2.0).
- Bugfix wisselmodal: doorschuif-info ontbrak en positie-select sprong terug (2.1).
- Bugfix wisselvoorstellen: geen onzin-wissels meer — alleen als veldspeler ≥1 min méér speelde dan bankspeler (2.2).
- Bugfix "Alles uitvoeren": dubbele bezetting van een positie bij vervallen doorschuif (2.3).

## Gedaan op 29 augustus 2026
- Project ingericht volgens vaste werkwijze: STATUS.md + BRIEFING.md aangemaakt, blokje toegevoegd in OVERZICHT.md. Historie gereconstrueerd uit de Cowork-sessie van 4 juli.
- **Versie 2.4 — spelsysteem per team**: in teambeheer (⚙️) stel je per team een spelsysteem in (bijv. 1-4-2-4). De voorkeursposities-picker, alle voorkeur-weergaves en de CSV-import volgen dat systeem (LCA/RCA, LS/RS enz.); opslag blijft in de 11 universele posities zodat alles blijft werken bij een afwijkend systeem in een wedstrijd. Nieuwe wedstrijden staan vooringevuld op het teamsysteem. Getest in de browser: picker, teammodal, wedstrijdformulier, auto-opstelling (MA→LCA = exacte match 100pt) en CSV-import (LCA→MA, LS→S).

## Open punten
- **Versie 2.4 naar Netlify slepen** (`netlify-upload/` staat klaar) en op hockey-coach.online checken dat het versienummer onderaan het codescherm 2.4 zegt.
- **Git loopt achter**: laatste commit is van 3 juli ("Add CLAUDE.md"), de wijzigingen t/m v2.3 zijn niet gecommit/gepusht naar https://github.com/millscreekbv-source/hockeycoach. Backup dus niet actueel.
- Geen bekende bugs; feedback uit echte wedstrijden afwachten (seizoen start weer).

## Eerstvolgende actie
`netlify-upload/` naar Netlify slepen (Deploys-tab) en versie 2.4 verifiëren op hockey-coach.online; daarna git commit + push als backup.

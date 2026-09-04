# STATUS — Hockey Coach App

Laatst bijgewerkt: 2026-09-04

## Huidige stand
- App staat op **versie 2.5** (4 september 2026). GitHub-backup up-to-date (commit 4d22da3). `netlify-upload/` is gevuld met 2.5 — **Auke moet de map nog naar Netlify slepen**; live op hockey-coach.online staat tot dan 2.4.
- Toegangscode van de app: **Shinty-app**.
- App is functioneel compleet en getest: teams, formaties (veld/zaal/jongste jeugd), auto-opstelling met rotatie, wisselvoorstellen + wisselplan, doorschuifwissels, live timer, wedstrijdverslag, CSV-import, backup/export, rondleiding, vaste keeper.

## Gedaan op 4 september 2026
- **Versie 2.5 — vaste keeper.** Melding van Auke: de keeper werd meegenomen in de wisselvoorstellen. Oorzaak: de app kende geen vaste keeper; alleen wie op het GK-slot stond werd als uitgaande speler overgeslagen, een keeper op de bank of op een ander slot deed gewoon mee en de auto-opstelling kon een ander in het doel zetten.
- Nieuw: vinkje **🧤 Vaste keeper** in het spelersformulier (onder de voorkeursposities). Gevolg: start altijd in het doel bij auto-toewijzen, komt nooit in wisselvoorstellen/wisselplan, niet als doorschuif-optie en niet als bankkandidaat (behalve als de keeperpositie zelf vrijkomt, bijv. blessure keeper). Handmatig wisselen blijft mogelijk. GK wordt bij opslaan als voorkeur 1 afgedwongen. Badge in spelerslijst, bankrij en spelerpopup. CSV-sjabloon/import heeft kolom 8 "Vaste keeper" (ja/x/1). Handleiding aangevuld.
- Getest in de browser: keeper in doel, keeper op bank, keeper per ongeluk op veldslot, spelersformulier, CSV-import. Daarna twee volledige wedstrijdsimulaties (4×17,5 min, wisselbeurten om de 8 min, blessurewissel op 20'): veld elke minuut 11 spelers zonder dubbele positie, keeper 70' zonder wissel, veldspelers gemiddeld exact op het theoretisch gemiddelde (50,0'), spreiding 46–54'.

## Open punten
- **Doorschuif in het wisselplan (verbeterpunt, geen bug):** `getSubSuggestions` markeert een doorschuiver (viaId) niet als "gebruikt", dus dezelfde speler kan in één ronde doorschuiver zijn én zelf gewisseld worden, of twee keer doorschuiver zijn. Bij "Alles uitvoeren" vervalt die doorschuif dan stilletjes (netjes afgevangen sinds 2.3, veld blijft kloppend) maar de plankaart beloofde iets anders. In de simulatie gebeurde dat in 6 van de 9 doorschuifplannen. Oplossing: viaId's meenemen in `usedField` bij het samenstellen van de voorstellen.
- Feedback uit echte wedstrijden afwachten (seizoen loopt weer).

## Eerstvolgende actie
Auke: `netlify-upload/` naar Netlify slepen en op de iPhone controleren dat versie 2.5 op het codescherm staat; daarna bij de keeper het vinkje Vaste keeper aanzetten. Bij een volgende sessie: het doorschuif-verbeterpunt oppakken (klein, in `getSubSuggestions`).

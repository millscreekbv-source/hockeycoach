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
- Testen kan via de browser-preview op het lokale bestand; wedstrijdscenario's zijn goed te simuleren via de console/`preview_eval` (state direct manipuleren, timer versneld). Dat heeft eerder echte bugs gevonden — bij wijzigingen aan wissellogica altijd een versnelde simulatie draaien.
- Auke test zelf op iPhone (Safari PWA) en stuurt screenshots bij rare situaties; wisselminuten en beurten in 📊 Overzicht maken die goed herleidbaar.
- Bij icoonwijzigingen: iOS ververst een beginschermicoon nooit — tegel verwijderen wist ook localStorage-data, dus altijd eerst laten exporteren (⚙️ → Exporteren).

## Valkuilen
- Wissellogica is het gevoeligste deel: voorstellen, wisselplan en doorschuifwissels grijpen op elkaar in. Historie: v2.1–v2.3 waren alle drie bugfixes in dit samenspel. Test na wijziging altijd: plan met meerdere wissels tegelijk uitvoeren, doorschuif gekoppeld aan een net-gewisselde speler, en de ≥1-minuut-drempel.
- Git wordt niet automatisch bijgehouden — check of de werkstand gecommit is (repo: millscreekbv-source/hockeycoach).

# Plan — van persoonlijke app naar betaald product

Opgesteld: 22 oktober 2026 · Uitgangspunt: versie 2.7

## Kern van het product
De onderscheidende kracht is **eerlijke speeltijdverdeling met slimme wisselvoorstellen**. Algemene team-apps (Spond, TeamApp, SportEasy) doen dat niet. Het betaalde product bouwt daarop voort en concurreert niet met hen op aanwezigheid, chat of contributie.

## Doelgroep
- **Focus: vrijwillige coaches van jeugd- en lagere teams.** Dat zijn per club tientallen teams, ze hebben het probleem (eerlijke speeltijd, discussie met ouders, weinig ervaring) en de club betaalt graag om hen te ondersteunen.
- **Tweede groep: jeugdselectieteams (bijv. O14-1, O16-1)** met een **prestatiemodus**: speeltijd mag ongelijk zijn, maar wel bewust. Instelbaar per team: van "gelijk" via "gewogen" naar "prestatie". De wisselvoorstellen wegen dan sterkte en vorm zwaarder dan het tijdsverschil, wisselen in vaste blokken/linies en tonen minuten als belasting in plaats van als eerlijkheid.
- **Geen apart product voor Heren/Dames 1 en 2.** Die hebben staf, video-analyse en GPS-pakketten; dat is een kleine, veeleisende markt. Wel waardevol als referentie ("ook ons eerste gebruikt het"), dus de prestatiemodus moet voor hen bruikbaar zijn.

## Fase 0 — Valideren (eerst, nog niets bouwen)
- 10–15 coaches (eigen club en daarbuiten) een paar wedstrijden laten gebruiken.
- Vragen: wat mist er, zou je €25 per seizoen betalen, zou de club betalen?
- Eén club als pilot vragen voor de clublicentie.
- Klaar als: minstens 5 coaches de app wekelijks gebruiken en 1 club interesse toont.

## Fase 1 — Pro lanceren
Voorwaarden om geld te kunnen vragen:
1. **Accounts + cloud-opslag** (Supabase): inloggen per mail/magic link, data per team in de database, lokale data eenmalig overzetten bij eerste login. Vervangt de toegangscode.
2. **Meerdere coaches per team**: uitnodigen per link; live wedstrijd synchroon (één bedient, de ander kijkt mee) via Supabase Realtime.
3. **Speeltijd over het seizoen**: percentage per speler over alle wedstrijden; auto-opstelling corrigeert over meerdere weken (uitbreiding van `getPreviousMatchInfo()`).
4. **Betalen**: Stripe Checkout, prijs per seizoen; gratis laag = 1 team, alleen lokaal (zoals nu).
5. **AVG**: privacyverklaring, alleen voornaam + rugnummer, data verwijderen op verzoek, verwerkersovereenkomst-sjabloon voor clubs.
6. **Herstructureren vóór de cloud-koppeling**: `index.html` (≈3900 regels) opsplitsen in modules met een lichte buildstap (bijv. Vite, zonder framework). De regel "alles in één bestand" past niet meer bij accounts, sync en betalingen.

### Datamodel (schets)
| Tabel | Belangrijkste velden |
|---|---|
| `clubs` | id, naam, kleuren (primair/secundair), logo-pad, licentie tot |
| `teams` | id, club_id?, naam, sport, formatie, kleur, seizoen |
| `team_members` | team_id, user_id, rol (eigenaar/coach/kijker) |
| `players` | id, team_id, voornaam, nummer, voorkeursposities (jsonb), vaste_keeper, gast_voor_wedstrijd |
| `matches` | id, team_id, datum, tegenstander, thuis/uit, config (jsonb), events (jsonb), status |
| `live_state` | match_id, state (jsonb), bijgewerkt_door, bijgewerkt_op — voor realtime meekijken |
| `subscriptions` | user_id of club_id, plan, stripe-id, geldig tot |

Row Level Security: toegang alleen via `team_members` (en clubbeheerders voor alle teams van hun club).

## Fase 2 — Groeien
- **Delen met ouders**: link naar opstelling vooraf en wedstrijdverslag achteraf (alleen-lezen pagina).
- **Wedstrijdschema importeren** (KNHB/hockey.nl); aanwezigheid koppelen aan Spond in plaats van zelf bouwen.
- **Coachnotities per speler**: privé ontwikkelpunten per vaardigheid/positie, met tijdlijn. Geen zichtbare sterren of cijfers.
- **Interne sterkte-score** zodat de auto-opstelling evenwichtige linies maakt.
- **Positie-doelen**: "iedereen minstens 3× achterin dit seizoen".
- **Clublicentie** met overzicht voor de technische commissie.

## Fase 3 — Tweede sport
- Sportprofiel als configuratie: posities, formaties, speeltijden, wisselregels (doorlopend/beperkt).
- Eerste kandidaat: **jeugdvoetbal** (grootste markt). Daarna futsal, basketbal, handbal.
- Eén codebase, maar per sport een eigen naam/landingspagina.
- Pas starten als hockey betalende gebruikers heeft.
- Native iOS-app (Capacitor) voor App Store-vindbaarheid, trillen bij wisselmoment en Apple Watch.

## Vormgeving

### Wat er beter kan
- **Zonlicht-modus**: langs het veld lees je in fel licht. Hoog contrast, grotere klok en namen, geen lichtgrijze tekst. Daarnaast een donkere modus voor avondwedstrijden en zaal.
- **Emoji vervangen door één set SVG-iconen** (nu ±40 emoji als knoppen: 🔨 📊 ❓ ⚙️ …). Emoji zien er per toestel anders uit en ogen minder professioneel.
- **Rustiger kaarten en lijsten**: meer witruimte, één duidelijke primaire actie per scherm, betere lege schermen ("Nog geen wedstrijden — plan je eerste").
- **Live-scherm**: klok en score als grootste elementen; wisselmoment visueel en met trillen aankondigen.
- **Onboarding** voor nieuwe coaches: team, spelers en eerste wedstrijd in drie stappen (rondleiding bestaat al als basis).
- **Een landingspagina** op hockey-coach.online met schermafbeeldingen, prijzen en "probeer gratis".

### Club look & feel
De app is daar al grotendeels op voorbereid: kleuren staan als CSS-variabelen (`--green`, `--green-dark`, `--accent` …) en teams hebben al een kleur. Er staan nog ±15 vaste kleurcodes in de CSS die eerst naar variabelen moeten.

Hoe het werkt:
1. Coach kiest zijn club uit een lijst (naam zoeken) of uploadt zelf een logo.
2. Uit de clubkleuren worden alle themavariabelen afgeleid: navigatiebalk, knoppen, accenten, `theme-color` van de statusbalk, avatars.
3. **Contrastcontrole** (WCAG): bij lichte clubkleuren (geel, wit) automatisch donkere tekst en een donkerdere variant voor knoppen. Zo blijft alles leesbaar.
4. Clublogo in de topbalk en op het gedeelde wedstrijdverslag.

Bronnen voor clubkleuren:
- **Zelf een logo uploaden → kleuren automatisch bepalen** (kleuren tellen via canvas, geen externe dienst). Werkt voor elke club en kan meteen, zonder backend.
- **Vaste clublijst** (naam, twee kleuren, logo) voor de grootste clubs; uit te breiden. Clublogo's zijn merkrecht van de club: alleen gebruiken met toestemming, of als de club zelf de licentie afneemt en het logo aanlevert.
- Bij de clublicentie stelt de club het thema centraal in voor al zijn teams. Dat is ook een verkoopargument: "de app in jullie eigen clubkleuren".

Voorgestelde aanpak: begin met **logo uploaden + automatische kleuren + contrastcontrole** als versie 2.8. Dat werkt nu al lokaal, levert direct iets zichtbaars op en is later het fundament voor het clubthema in de licentie.

# Plan — met meerdere coaches aan één team werken

Opgesteld: 1 november 2026 · Uitgangspunt: versie 2.13 · Hoort bij Fase 1 van `PLAN-BETAALDE-APP.md`

## Wat de coach ermee kan
1. **Team delen:** de coach maakt een uitnodigingslink en stuurt die (bijv. via WhatsApp) naar een medecoach of teammanager.
2. **Samen beheren:** iedereen met toegang ziet en bewerkt dezelfde spelers, wedstrijden, taken (rijden/fruit) en het programma. Wijzigingen verschijnen binnen een paar seconden bij de anderen.
3. **Live meekijken:** één coach bedient de wedstrijd (klok, wissels, doelpunten); de andere ziet hetzelfde scherm live mee en kan de bediening overnemen ("Ik neem over"), bijvoorbeeld als de batterij leeg raakt.
4. **Zonder account blijft alles werken zoals nu:** alleen op je eigen telefoon. Een account is alleen nodig om te delen.

## Rollen
| Rol | Mag |
|---|---|
| Eigenaar | alles, coaches uitnodigen en verwijderen, team verwijderen |
| Coach | spelers, wedstrijden, taken en live wedstrijd bewerken |
| Meekijker (later) | alleen lezen — bijv. teammanager of ouder; basis voor "delen met ouders" |

## Hoe het technisch werkt
- **Inloggen met een e-maillink** (magic link, geen wachtwoord). Nodig: alleen het e-mailadres van de coach.
- **Gegevens per team in Supabase** (EU-regio), met Row Level Security: alleen leden van een team zien dat team.
- **Telefoon blijft de basis (offline eerst).** Alles wordt eerst lokaal opgeslagen zoals nu en daarna gesynchroniseerd. Op een veld zonder bereik loopt de wedstrijd gewoon door; zodra er weer bereik is, gaat alles mee.
- **Per wedstrijd en per speler een eigen rij** (niet het hele team als één blok), zodat twee coaches die tegelijk iets anders aanpassen elkaar niet overschrijven. Bij een echt conflict (zelfde wedstrijd tegelijk) wint de laatste wijziging; de live wedstrijd heeft één bediener, dus daar kan het niet botsen.
- **Live meekijken via Supabase Realtime:** de bediener stuurt bij elke gebeurtenis (wissel, doelpunt, klok start/stop) en elke 10 seconden de stand; de meekijker rekent de klok zelf door.
- **Eerste keer inloggen:** de app vraagt "Je hebt al gegevens op deze telefoon — overzetten naar je account?" en zet ze één keer over.
- **Supabase-client via een vaste CDN-versie**, zoals bij AI-huiswerkmaatje. Dat is een uitzondering op de regel "geen externe dependencies"; `index.html` blijft één bestand.

### Datamodel (schets)
| Tabel | Velden | Toegang (RLS) |
|---|---|---|
| `teams` | id, naam, kleur, spelsysteem, thema, taken, instellingen (jsonb), eigenaar | leden lezen; coaches/eigenaar schrijven |
| `team_members` | team_id, user_id, rol | leden zien elkaar; eigenaar beheert |
| `team_invites` | token, team_id, rol, verloopt_op, aangemaakt_door | eigenaar maakt aan; inwisselen via functie |
| `players` | id, team_id, data (jsonb: voornaam, nummer, posities, vaste keeper) | leden |
| `matches` | id, team_id, datum, data (jsonb: config, afwezigen, taken, events, …), bijgewerkt_op | leden |
| `live_state` | team_id, match_id, bediener (user_id), state (jsonb), bijgewerkt_op | leden lezen; alleen bediener schrijft |

## AVG en veiligheid
- Alleen **voornaam + rugnummer** van spelers (kinderen) in de database; geen geboortedatum, geen foto's.
- Supabase in de **EU-regio**; verwerkersovereenkomst van Supabase afsluiten.
- Korte **privacyverklaring** in de app: wat er wordt opgeslagen, waarom, en hoe je alles verwijdert.
- Knop **Account en gegevens verwijderen**.
- De toegangscode verdwijnt voor accounts; de lokale modus houdt hem voorlopig.

## Stappen
| Stap | Wat | Klaar als |
|---|---|---|
| 0 | Supabase-project aanmaken (na jouw keuze en akkoord over kosten) | project in EU-regio, tabellen + RLS, getest met 2 testaccounts |
| 1 | Inloggen met e-maillink, account-scherm, gegevens overzetten | inloggen op iPhone (Safari én beginscherm-app) werkt; lokale gegevens staan in de cloud |
| 2 | Synchroniseren spelers, wedstrijden, taken (offline eerst) | wijziging op toestel A staat binnen enkele seconden op toestel B; vliegtuigmodus-test slaagt |
| 3 | Uitnodigen en rollen | medecoach komt via link in het team; eigenaar kan hem weer verwijderen |
| 4 | Live meekijken + bediening overnemen | tweede telefoon volgt een gesimuleerde wedstrijd zonder verschil in minuten |
| 5 | Privacyverklaring, account verwijderen, handleiding | Auke en één medecoach gebruiken het een wedstrijddag |

Daarna kan de AI-vragenfunctie bij de spelregels (Claude-API achter de inlog) en "delen met ouders" (meekijker-rol) erop voortbouwen.

## Te kiezen door Auke (één voor één)
1. **Waar draait het?** Het gratis Supabase-abonnement is vol (2 actieve projecten: Voedingsapp en AI-huiswerkmaatje).
   - **A — Supabase Pro in een aparte organisatie "Hockey Coach"** (aanbevolen): ± $25 per maand, pauzeert nooit, klaar voor de betaalde versie, zelfde systeem als je andere apps.
   - B — Firebase (Google), gratis laag: geen maandkosten en sterk in offline, maar een nieuw systeem naast Supabase.
   - C — Een bestaand gratis project tijdelijk pauzeren: niet aan te raden, dat stopt die app.
2. Inloggen alleen met e-maillink, of ook met Apple/Google?
3. Wie mag uitnodigen: alleen de eigenaar, of elke coach?
4. Toegangscode: weg zodra accounts er zijn, of voorlopig houden voor de lokale modus?
5. Met welke medecoach testen we stap 5?

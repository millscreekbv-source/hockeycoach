# Mailreeks clubs — Hockey Coach

Opgesteld: 22 oktober 2026 · Status: **concept, nog niets verstuurd**

## Uitgangspunten
- **Ontvanger**: technische commissie of jeugdcoördinator, via het algemene adres uit `leads.csv` (tc@, jeugd@, secretariaat@, info@). Bij een secretariaats- of info-adres vraagt de eerste zin om de mail door te sturen.
- **Kern**: eerlijke speeltijd zonder rekenwerk, en daardoor minder discussie met ouders.
- **Aanbod**: gratis pilot voor één team, de rest van het seizoen.
- **Toon**: van coach tot coach, kort (maximaal ±120 woorden), geen verkooppraat, één vraag per mail.
- **Ritme**: mail 1 op dag 0, mail 2 rond dag 7, mail 3 rond dag 14. Stoppen zodra er een reactie komt, ook bij een 'nee'.
- **Timing**: clubs beslissen in het voorjaar over het volgende seizoen. Een pilot in november–februari levert dus precies op tijd ervaring op voor dat besluit. Verstuur niet in de kerstvakantie.
- **Volume**: 10–15 clubs per week, verstuurd door Auke zelf vanuit een gewone mailbox (geen bulktool). Dat is persoonlijker en voorkomt spamfilters.
- **Afmelden**: elke mail eindigt met een afmeldzin. Een afmelding verwerk je dezelfde dag (zie `antwoordflow.md`).

Variabelen: `{club}`, `{aanhef}` (standaard "Beste technische commissie" of "Beste jeugdcommissie", afhankelijk van het adres), `{persoonlijke_zin}` (optioneel; zie hieronder).

> **Persoonlijke zin**: één zin die laat zien dat dit geen bulkmail is. Bijvoorbeeld: "We speelden dit seizoen al tegen jullie MO12" of "Ik zag dat {club} dit jaar flink in de jeugd is gegroeid". Voor clubs in de regio (kolom `prioriteit` = `regio` in `leads.csv`): "Ik woon in Driebergen, dus langskomen voor een demo op de club is zo geregeld." Begin ook met die clubs: dichtbij is een pilot makkelijker te begeleiden. Weet je niets specifieks, laat de zin dan weg: liever geen zin dan een verzonnen zin.

---

## Mail 1 — Introductie (dag 0)

**Onderwerp**: Eerlijke speeltijd bij de jeugd van {club}
*(alternatief: "Minder speeltijddiscussies langs de lijn?")*

{aanhef},

Mijn naam is Auke Meulenbroek. Ik coach zelf een meisjesteam in de jeugd. {persoonlijke_zin}

Elke coach kent het: na de wedstrijd vraagt een ouder waarom zijn of haar kind minder speelde. Om dat te voorkomen heb ik Hockey Coach gebouwd, een app voor langs de lijn. De app houdt de speeltijd per speler bij en stelt zelf eerlijke wissels voor, rekening houdend met posities en de keeper. Na afloop zie je precies wie hoeveel minuten heeft gespeeld.

Ik zoek een paar clubs die het een paar weken gratis willen proberen met één jeugdteam. Ik help zelf bij het opzetten en hoor graag wat beter kan.

Zou dit iets zijn voor een van jullie teams? Kijken kan ook op hockey-coach.online.

Met sportieve groet,
Auke Meulenbroek
Hockey Coach · hockey-coach.online · [telefoonnummer]

*Is dit niet het juiste adres, of wil je liever geen mail meer van mij? Laat het weten, dan stuur ik niets meer.*

---

## Mail 2 — Opvolging (dag ±7)

**Onderwerp**: Re: Eerlijke speeltijd bij de jeugd van {club}

{aanhef},

Een korte opvolging op mijn mail van vorige week. Ik weet dat de commissie het druk heeft in het seizoen.

Wat coaches die de app gebruiken het meest noemen: de wisselbeurten hoeven ze niet meer zelf te tellen, en als een ouder vraagt hoe het zit, kunnen ze het overzicht laten zien. Dat scheelt gesprekken.

De pilot is gratis en vraagt weinig: één coach, één team, een paar wedstrijden. Hoe een opstelling en wisselvoorstel eruitzien, laat ik in een kwartier (online of op jullie club) zien.

Mag ik het aan een van jullie coaches laten zien?

Groet,
Auke Meulenbroek
hockey-coach.online

*Liever geen mail meer? Een kort 'nee' is genoeg, dan hoor je niets meer van mij.*

> ⚠️ **Nagaan vóór verzending**: noem in de tweede alinea alleen wat coaches echt zeggen. Zolang er nog geen andere gebruikers zijn, verander je de tweede zin in: "Wat ik zelf merk: ik hoef de wisselbeurten niet meer te tellen, en als een ouder vraagt hoe het zit, laat ik het overzicht zien."

---

## Mail 3 — Laatste mail (dag ±14)

**Onderwerp**: Re: Eerlijke speeltijd bij de jeugd van {club}

{aanhef},

Dit is mijn laatste mail hierover, ik wil niet blijven aandringen.

Mocht speeltijd bij jullie jeugdteams later dit seizoen toch een onderwerp worden, bijvoorbeeld bij de voorbereiding van het volgende seizoen, dan staat het aanbod voor een gratis pilot voor één team nog steeds. Een kort antwoord op deze mail is genoeg.

Komt dit nu niet uit? Dan stuur ik in maart een korte mail, als jullie het volgende seizoen plannen. Wil je dat liever niet, laat het dan even weten.

Succes met het seizoen!

Auke Meulenbroek
hockey-coach.online

*Wil je geen mail meer van mij? Antwoord met 'afmelden', dan haal ik {club} van mijn lijst.*

---

## Volgorde
1. **Shinty (eigen club)**: niet via deze reeks. De jeugdcoaches gebruiken de app al sinds begin 2026. Vraag ze eerst hoe het bevalt (dat is de validatie uit fase 0 van het plan) en stel daarna de TC voor om Shinty de eerste pilotclub te maken. Shinty-coaches blijven dit seizoen gratis gebruiken.
2. **Regio** (16 clubs rond Driebergen): de eerste twee weken.
3. **Grootste clubs** (53): daarna, 10–15 per week.

## Voor verzending nog regelen (keuze Auke)
1. **Afzenderadres**: een adres op het eigen domein (bijv. `auke@hockey-coach.online`) oogt professioneler dan Gmail. Dat vraagt mail-DNS-records in Netlify DNS (MX, SPF, DKIM). Alternatief: voorlopig `millscreekbv@gmail.com`.
2. **Telefoonnummer** in mail 1, wel of niet.
3. **Landingspagina**: de mails verwijzen naar hockey-coach.online, maar daar staat nu het codescherm van de app. Voor pilotclubs is een korte pagina met schermafbeeldingen en "pilot aanvragen" wenselijk (staat ook in het plan). Tot die er is: verwijs niet naar de site en bied een demo aan.
4. **Gratis pilot afbakenen**: welk team, hoe lang (voorstel: tot de winterstop of tot 1 april), en wat de club teruggeeft (voorstel: een evaluatiegesprek van 20 minuten).
5. **Juridisch**: ongevraagde zakelijke mail aan het algemene adres van een vereniging (rechtspersoon) mag in Nederland, mits je je duidelijk identificeert en elke mail een afmeldmogelijkheid heeft. Persoonlijke adressen van vrijwilligers vallen daar niet onder en staan daarom niet in de lijst. *(Dit is geen juridisch advies; bij twijfel even checken.)*

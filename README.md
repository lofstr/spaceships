# Visma projekt

- Tre våningar á 15 platser

* En tabell för parkeringsgarage (collection)
  --> En item för varje våning med följande värde:
  Våning, antal platser, collection med parkeringsplatser:
  --> Varje parkeringsplats har följande värden: Parkeringsplats(Int), isParked (False ? RegNummer), Date(Optional)

* En loggbok (collection)

- Unika idn -
  Vilken plats rymdskeppet hämtades från.
  RegNummer
  Timestamp

Tankar:
Ifall man inte sparar när man parkerat finns ingen traceability - Lösningar:

- Spara priset i loggboken vid utcheckning
- Logga incheckning också
- Spara datum för parkering i loggboken

Avgränsningar

- Kan inte parkera om regnumret redan finns parkerat.
- Parkerar på random plats
- Proof-of-concept (Inte lagt fokus på säkerhet)

Förbättringar

- Söktiden kan bli bättre, kan kolla en våning i taget istället för alla direkt.
- Inga checks ifall någon spammar atm - Då kan man registrera flera på samma regnummer.
- Borde skickas upp till molnet (Cloud Functions) och hanteras där för säkerhet.
- Parkera på specifik plats

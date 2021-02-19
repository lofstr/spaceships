# Visma projekt

Lösningen är gjord med hjälp av Firebase/Firestore och instantieras med hjälp av React.

Run project with npm start  
Backend-code is under src/components/fb.js  
Other componenents were made for some sort of UI used for testing.  
Database is firestore.

## Tre våningar á 15 platser

En tabell för parkeringsgarage (collection)
--> En item för varje våning med följande värde:

- Våning,
- antal platser,
- collection med parkeringsplatser:
  - Parkeringsplats(Int),
  - parked (False ? RegNummer),
  - Date

## En loggbok (collection)

Unika idn

- Vilken plats rymdskeppet hämtades från.
- RegNummer
- Timestamp

## Tankar

Ifall man inte sparar när man parkerat finns ingen traceability - Lösningar:

- Spara priset i loggboken vid utcheckning
- Logga incheckning också
- Spara datum för parkering i loggboken

Avgränsningar

- Kan inte parkera om regnumret redan finns parkerat.
- Parkerar på random plats

Förbättringar

- Söktiden kan bli bättre, kan kolla en våning i taget istället för alla direkt.
- Inga checks ifall någon spammar atm - Då kan man registrera flera på samma regnummer.
- Borde skickas upp till molnet (Cloud Functions) och hanteras där för säkerhet.
- Parkera på specifik plats
- Lägga till fler våningar och plats på våningar kan göras mer dynamiskt.

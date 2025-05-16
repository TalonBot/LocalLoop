# LocalLoop

## Opis
Platforma, ki povezuje lokalne pridelovalce, obrtnike in potrošnike ter spodbuja trajnostno nakupovanje. Omogoča preprosto iskanje ponudnikov v bližini, naročanje izdelkov s prevzemom ali dostavo ter podporo lokalnim podjetjem. Vključuje sezonske kataloge, priporočila na podlagi interesov in možnost skupinskih nakupov.

## Uporabniki
- Kmetje  
- Čebelarji  
- Domači obrtniki  
- Potrošniki, ki iščejo lokalne in sveže izdelke

## Ključne funkcionalnosti
- ✅ Interaktivni zemljevid ponudnikov z možnostjo filtriranja po kategorijah  
- ✅ Digitalna tržnica z enostavno oddajo naročil in pregledom razpoložljivosti  
- ✅ Zgodbe ponudnikov in certifikati (ekološko, lokalno ipd.)  
- ✅ Skupinska naročila: povezovanje kupcev za skupinske popuste  

---

## Ekipa

Projekt izvajajo študenti:
- XXX  
- XXX  
- XXX  

---

## Tehnologije

Do sedaj uporabljene tehnologije vključujejo:
- **Frontend**: [Next.js (App Router)](https://nextjs.org/), TypeScript, Tailwind CSS  
- **Backend**: Express.js, Supabase (avtentikacija in podatkovna baza), Redis  
- **Avtentikacija**: Google OAuth 2.0  
- **Drugo**: CSRF zaščita, middleware, modularna arhitektura  

---

## Zagon projekta

Projekt je razdeljen na dva dela: **frontend** (uporabniški vmesnik) in **backend** (logika, API, avtentikacija).

### 1. Backend

#### Namestitev
```bash
cd backend
npm install
```

#### .env konfiguracija
Ustvari datoteko `.env` v mapi `backend/` in vanjo vpiši naslednje vrednosti (nadomesti s pravimi podatki):

```env
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
REDIS_URL=...
REDIS_PORT=...
SECRET_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
NODE_ENV=development
```

#### Zagon
```bash
node server.js
```

Backend bo dosegljiv na: `http://localhost:5000`

---

### 2. Frontend

#### Namestitev
```bash
cd frontend
npm install
```

#### Zagon
```bash
npm run dev
```

Frontend bo dosegljiv na: `http://localhost:3000`

---

## Projektna struktura

```
/backend
  - config/
  - controllers/
  - middleware/
  - routes/
  - server.js
  - .env

/frontend
  /src
    - app/
    - components/
    - styles/
  - public/
  - tailwind.config.js
  - next.config.ts
```

---

## Status

Trenutno je vzpostavljena osnovna infrastruktura:
- Frontend z App Router arhitekturo
- Navbar in layout
- Delujoč backend z vezavo na Supabase, Redis in OAuth
- Projektna struktura pripravljena za nadaljnji razvoj

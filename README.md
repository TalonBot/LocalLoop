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
- Georgi Dimov  
- Tilen Gabor  
- Anastasija Nechoska  

---

## Tehnologije  

**Frontend:**  
- [Next.js (App Router)](https://nextjs.org/)  
- TypeScript  
- Tailwind CSS  
- Redux (za upravljanje stanja)

**Backend:**  
- **Express.js** – strežniški framework (dockeriziran)
- **Supabase** – PostgreSQL baza podatkov + shranjevanje datotek
- **Redis** – upravljanje sej uporabnikov
- **Stripe** – procesiranje plačil
- **SendGrid** – pošiljanje e-pošt s predlogami(html templates)
- **Passport + Google OAuth 2.0** – avtentikacija uporabnikov
- **JWT (jsonwebtoken)** – upravljanje prijavnih žetonov
- **Multer** – nalaganje datotek
- **Node-Cron** – urniki za avtomatizirana opravila
- **PDFMake** – generiranje PDF-jev (invoices)
- **Express Validator** – validacija vhodnih podatkov
- **Rate Limiting** – zaščita pred zlorabami (npr. brute-force napadi)
- **CSRF zaščita** – preko token mehanizmov
- **Jest + Supertest** – testiranje API-jev
- **Nodemon** – avtomatski restart strežnika med razvojem
- **Docker** – za razvojno in produkcijsko okolje (docker-compose)

**Avtentikacija in varnost:**  
- Google OAuth 2.0  
- CSRF zaščita  
- Middleware sloji  
- Modularna arhitektura

**CI/CD in avtomatizacija:**  
- GitHub Actions: avtomatska gradnja Docker kontejnerja, izvajanje testov in obvestilo Render prek webhooka  
- Vercel: samodejna posodobitev frontend aplikacije ob vsakem pushu  
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
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
REDIS_URL=
REDIS_PORT=
SECRET_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
NODE_ENV=development
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLIENT_URL=http://localhost:5000
SENDGRID_API_KEY=
SUPPORT_EMAIL=
FRONTEND_URL=http://localhost:3000
SENDGRID_VERIFICATION_TEMPLATE_ID=
SENDGRID_ORDER_TEMPLATE_ID=
SENDGRID_GROUP_ORDER_TEMPLATE_ID=
SENDGRID_WEEKLY_TEMPLATE_ID=
SENDGRID_PICKUP_TEMPLATE_ID=
SENDGRID_APPROVED_TEMPLATE_ID=
SENDGRID_REJECTED_TEMPLATE_ID=

```

#### Zagon
Če uporabljaš lokalni zagon brez Dockerja:
```bash
npm start
```

Backend bo dosegljiv na: `http://localhost:5000`

Če uporabljaš Docker:
```bash
docker-compose up --build

```
---

### 2. Frontend

#### Namestitev
```bash
cd frontend
npm install
```

#### .env konfiguracija
Ustvari datoteko `.env` v mapi `frontend2/` in vanjo vpiši naslednjo vrednost:

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
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
  - tests/
  - assets/
  - config/
  - controllers/
      - admin/
      - provider/
  - cron/
  - fonts/
  - helpers/
  - middleware/
      - validators/
            - admin/
            - consumer/
            - provider/
  - routes/
  - server.js
  - .env
  - Dockerfile
  - docker-compose.yml

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
- ✅ Projekt je zaključen.
- ✅ CI/CD avtomatizacija je vpeljana (Docker build + testiranje + Render webhook).
- ✅ Frontend se samodejno posodablja prek Vercela.
- ✅ Vzpostavljena je stabilna infrastruktura za nadaljnjo rabo ali širitev.


---

## Dostop do gostovane aplikacije

Platformo lahko obiščete na:  
[https://local-loop-five.vercel.app/](https://local-loop-five.vercel.app/)  


---


# BlablaJI

Application web de covoiturage local inspiree de BlaBlaCar, pensee pour Jose Ignacio et les trajets frequents autour de la cote uruguayenne.

## Ce qui est deja en place

- Interface Next.js 16 avec TypeScript, App Router et Tailwind CSS 4.
- Experience v1 couvrant accueil, recherche de trajets, publication, messagerie et tableau de bord admin.
- Donnees mockees locales pour illustrer les usages autour de Jose Ignacio, La Barra, Punta del Este, Maldonado et San Carlos.
- Structure de domaine simple pour brancher ensuite une API, Supabase, des paiements et un client mobile.

## Parcours couverts

- Inscription / connexion: surface UI prete a brancher a Supabase Auth ou Clerk.
- Publier un trajet: formulaire conducteur avec prix, places, vehicule et preferences.
- Rechercher un trajet: filtres depart, destination, date, prix et preferences.
- Reserver une place: CTA present dans les cartes de trajet.
- Messagerie: interface conducteur/passager avant depart.
- Avis / notes: section de confiance et structure de reviews.
- Admin moderation: vue de suivi des signalements et indicateurs de confiance.

## Stack technique

- Next.js 16
- React 19
- TypeScript strict
- Tailwind CSS 4
- ESLint

## Demarrage

```bash
npm install
npm run dev
```

## Build et verification

```bash
npm run lint
npm run build
```

## Supabase Auth

- Active la confirmation email dans `Authentication > Providers > Email`.
- Configure `Site URL` avec l'URL principale de l'application, par exemple `https://blablaji.vercel.app`.
- Ajoute aussi dans `Additional Redirect URLs` les URLs utilisees par l'app:
	- `http://localhost:3001/es/welcome`
	- `http://localhost:3001/fr/welcome`
	- `https://blablaji.vercel.app/es/welcome`
	- `https://blablaji.vercel.app/fr/welcome`
- Renseigne `NEXT_PUBLIC_APP_URL` dans `.env.local` et dans Vercel avec l'URL publique principale, par exemple `https://blablaji.vercel.app`.

L'application utilise cette URL pour que les emails de confirmation Supabase renvoient directement vers la page welcome localisee.

## Backend cible recommande

- Authentification: Supabase Auth
- Base de donnees: Postgres via Supabase
- Temps reel messagerie: Realtime / websockets
- Paiement local: Mercado Pago ou equivalent plus tard
- Admin: routes protegees avec role `admin`

Un schema SQL initial est fourni dans `supabase/schema.sql`.
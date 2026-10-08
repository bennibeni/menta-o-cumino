# Menta o Cumino

Categoria: **Giochi**. App autonoma React + Vite derivata da Next13/R46.
La versione Next13 rimane disponibile, senza sincronizzazione automatica.

## Sviluppo

Node 22.19 usato nella preparazione.

```sh
npm install
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

La build statica si trova in `dist`. Non richiede server applicativi o chiavi API.

## Pubblicazione

Non ancora pubblicata. Il footer nello stile di Alveare è già incluso, con il link All projects.
Dopo il deploy inserire l’URL reale in `links-page-main/data/projects.mjs`, categoria Giochi, usando i metadati di `project-info.json`. Non aggiungere URL provvisori al catalogo pubblico.

## Modello

Facile: facce colorate. Difficile: gruppi ai vertici e recettore a disco.
Sono analogie geometriche, non strutture complete del carvone o recettori biologici reali.

## Visual Studio Code

Aprire la cartella radice del progetto e installare le estensioni consigliate dalla sezione Extensions. La configurazione locale abilita Prettier al salvataggio e le correzioni ESLint al salvataggio esplicito. Le impostazioni globali di VS Code restano invariate.

- `npm run lint`: controlla il codice.
- `npm run lint:fix`: applica le correzioni automatiche ESLint.
- `npm run format`: formatta i file con Prettier.
- `npm run format:check`: verifica la formattazione senza modificare i file.

`.editorconfig` uniforma UTF-8, indentazione e fine riga LF. `jsconfig.json` configura la navigazione JavaScript/JSX senza introdurre TypeScript nel progetto. `eslint-config-prettier` disattiva eventuali regole stilistiche in conflitto con Prettier.

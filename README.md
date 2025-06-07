# Postkarten Web App (Hostinger Horizons Projekt)

Dies ist eine Web-Anwendung zur Erstellung, Verwaltung und zum Teilen digitaler Postkarten. Das erstellen)

2.  **Repository klonen (falls noch nicht geschehen):**
    ```bash
    git clone https://github.com/DEIN_USERNAME/DEIN_PROJEKTNAME.git
    cd DEIN_PROJEKTNAME
    ```

3.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    # oder
    yarn install
    ```

4.  **Supabase-Konfiguration:**
    *   Erstelle eine Datei `src/lib/supabaseClient.js` (oder überprüfe die existierende Datei).
    *    Projekt wurde initial mit Hostinger Horizons generiert und wird nun weiterentwickelt.

## Verwendeter Tech-Stack

*   **Frontend:** React, Vite, JavaScript (JSX)
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS, shadcn/ui (Komponenten)
*   **Animationen:** Framer Motion
*   **Backend & Datenbank:** Supabase (PostgreSQL, Auth, Storage)
*   **Linting:** ESLint (mit `eslint-config-react-app`)

## Features (Aktueller Stand)

*   BenTrage deine Supabase Projekt-URL und den `anon_key` ein. Du findest diese in deinem Supabase Projekt-Dashboard unter "Project Settings" > "API".
        ```javascript
        // src/lib/supabaseClient.js
        import { createClient } from '@supabase/supabase-js';

        const supabaseUrl = 'DEINE_SUPABASE_PROJEKT_URL';
        const supabaseAnonKey = 'DEIN_SUPABASE_ANON_KEY';

        export const supabase = createClient(supabaseUrl, supabaseAnonKey);
        ```
    *   **WICHTIG:** Wenn du `.env` Dateien für die Supabase-Keys verwendest (emputzerauthentifizierung (E-Mail/Passwort, Google OAuth)
*   Dashboard mit:
    *   Profilübersicht und -bearbeitung
    *   Anzeige eigener Postkarten
    *   Anzeige öffentlicher Postkarten
    *   Responsive Sidebar-Navigation (Burger-Menü für Mobile)
*   Postkarten-Editor:
    *   Erstellen und Bearbeiten von Postkarten (Vorder-/Rückseite)
    *   Auswahl von Templates
    *   Grundlegende Text- und Bildbearbeitung (inkl. Uploadfohlen!), stelle sicher, dass `supabaseClient.js` diese Variablen liest (z.B. `import.meta.env.VITE_SUPABASE_URL`). Erstelle dann eine `.env`-Datei im Wurzelverzeichnis (diese wird durch `.gitignore` ignoriert):
        ```env
        # .env
        VITE_SUPABASE_URL=DEINE_SUPABASE_PROJEKT_URL
        VITE_SUPABASE_ANON_KEY=DEIN_SUPABASE_ANON_KEY
        VITE_OPENAI_API_KEY=DEIN_OPENAI_API_KEY
        ```

5.  **Supabase Datenbank-Schema:**
    *   Das notwendige Datenbankschema (Tabellen, RLS, Funktionen) wurde bereits über den Supabase SQL Editor oder durch vorherige Schritte eingerichtet. Falls du das Projekt neu aufsetzt und das Schema manuell erstellen musst, be zu Supabase Storage)
    *   Eigenschaftsinspektor und Werkzeugleiste
*   Postkarten-Detailansicht:
    *   Anzeige der Postkartendetails
    *   Optionen für Eigentümer: Bearbeiten, Löschen, Freigabelinks erstellen/verwalten
*   Freigabelinks und öffentliche Ansicht für geteilte Postkarten (TODO: `/share/:shareToken` Seite)

## Lokales Setup

1.  **Voraussetzungen:**
    *   [Node.js](https://nodejs.org/) (Version 18.x oder höher empfohlen)
    *   [npm](https://www.npmjs.com/) oder [yarn](https://yarnpkg.com/)
    *   Ein Supabase-Projekt (Datenziehe dich auf die SQL-Skripte aus der bisherigen Entwicklung.

6.  **Supabase Storage:**
    *   Stelle sicher, dass in deinem Supabase-Projekt ein öffentlicher Storage Bucket namens `postcard_images` existiert (für Bild-Uploads im Editor).

7.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    # oder
    yarn dev
    ```
    Die Anwendung sollte nun unter `http://localhost:5173` (oder einem ähnlichen Port) erreichbar sein.

## Nächste Schritte & Geplante Features

*   Implementierung der öffentlichen Ansichtsseite für geteilte Postkarten (`/share/:shareToken`).
*   Drag & Drop Funktionalität im Editor-Vorschau.
bank, Auth, Storage)

2.  **Klonen des Repositories (optional, wenn du es schon lokal hast):**
    ```bash
    git clone https://github.com/DEIN-USERNAME/DEIN-PROJEKTNAME.git
    cd DEIN-PROJEKTNAME
    ```

3.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    # oder
    yarn install
    ```

4.  **Supabase Konfiguration:**
    *   Erstelle eine Datei `src/lib/supabaseClient.js` (falls sie anders heißt, passe den Pfad an).
    *   Füge deine Supabase Projekt-URL und den `anon` Key ein:
        ```javascript
        import { createClient } from '@supabase/supabase-js';

        const supabaseUrl = 'DEINE_SUPABASE_URL';
        const supabaseAnonKey = 'DEIN_SUPABASE_ANON_KEY';

        export const supabase = createClient(supabaseUrl, supabaseAnonKey);
        ```
    *   **WICHTIG:** Speichere diese Keys **nicht** als Umgebungsvariablen*   Undo/Redo Funktionalität im Editor.
*   Erweiterte Styling-Optionen und Elementtypen.
*   Performance-Optimierungen.
*   Umfassende Fehlerbehandlung und Testabdeckung.
*   ... (weitere Ideen)

## Beitrag

(Informationen, falls du planst, dass andere beitragen können - für den Moment optional)

---
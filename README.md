# NYC Rat Ident

A Vite + React + TypeScript SPA application ready for Firebase deployment.

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

Run the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:

```bash
pnpm build
```

The production build will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
pnpm preview
```

## Firebase Deployment

### Initial Setup

1. Install Firebase CLI (if not already installed):
   ```bash
   pnpm add -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Link the Firebase project (creates the git-ignored `.firebaserc`):
   ```bash
   firebase projects:list
   firebase use --add <project-id>
   ```
   `firebase.json` already targets the `nycratidentification` hosting site.

### Deploy

1. Build the application:
   ```bash
   pnpm build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

Optional:
- `firebase hosting:channel:deploy preview` — deploy to a temporary preview URL first
- `firebase hosting:rollback` — revert to the previous release

## Project Structure

```
nycRatIdent/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   ├── pages/      # Page components
│   ├── App.tsx     # Main app component with routing
│   ├── main.tsx    # Entry point
│   └── index.css   # Global styles
├── firebase.json    # Firebase hosting configuration
└── vite.config.ts   # Vite configuration
```

## Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Firebase Hosting** - Static site hosting

## Credits

- Rat head overlay (`public/rat-head.png`): head cut out of
  [Fancy rat blaze.jpg](https://commons.wikimedia.org/wiki/File:Fancy_rat_blaze.jpg)
  by AlexK100, licensed
  [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). The cutout
  is shared under the same license.

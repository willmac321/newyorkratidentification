# NYC Rat Ident

A Vite + React + TypeScript SPA application ready for Firebase deployment.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Firebase Deployment

### Initial Setup

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Use existing project or create new one
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Set up automatic builds: No (manual deployment)

4. Update `.firebaserc` with your Firebase project ID

### Deploy

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

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


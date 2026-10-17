# PATH

A prototype website that helps students explore careers based on their
interests and build a self-paced roadmap toward one. Built with plain
HTML, CSS, and JavaScript — no frameworks, no build step.

**Flow:** interests → potential careers → choose a career → personalized
roadmap → local opportunities → track progress.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure / all six screens |
| `style.css` | All styling |
| `script.js` | App logic: quiz, scoring, career matching, roadmap, dashboard |
| `firebase-config.js` | Your Firebase project keys (see setup below) |

## Running it locally

No install needed — just open `index.html` in a browser. If
`firebase-config.js` still has placeholder values, the app automatically
saves progress to that browser only (no login required), so it works
out of the box.

## Turning on accounts (Firebase)

To let each student log in and save their own progress to the cloud:

1. Go to the [Firebase console](https://console.firebase.google.com) →
   **Add project**.
2. Click the **`</>`** icon to register a web app, and copy the
   `firebaseConfig` values it gives you into `firebase-config.js`,
   replacing the `"REPLACE_ME"` placeholders.
3. **Build → Authentication → Get started** → enable **Email/Password**.
4. **Build → Firestore Database → Create database** → start in test mode.

> The API key in `firebase-config.js` is safe to commit to a public
> repo — Firebase web API keys aren't secret by design. Access is
> actually controlled by your Firestore security rules and Authentication
> settings, not by hiding this file. (Before using this with real
> students, tighten the default test-mode Firestore rules so users can
> only read/write their own document.)

## Deploying with Firebase Hosting

From inside this project folder:

```bash
npm install -g firebase-tools   # one-time install
firebase login                  # opens a browser to sign in
firebase init hosting           # pick your project; public directory = "."
                                 # answer "No" to single-page app
                                 # answer "No" to GitHub builds
                                 # don't overwrite index.html
firebase deploy
```

Firebase prints a live URL (e.g. `https://yourproject.web.app`) when it's
done.

## Deploying updates after the first time

```bash
firebase deploy
```

That's it — no `init` step needed again.

## Customizing

- **Careers**: edit the `CAREERS` array near the top of `script.js`.
- **Assessment questions**: edit the `QUESTIONS` array in `script.js`.
- **Local opportunities**: edit `OPPORTUNITIES_BY_REGION` in `script.js`.

Everything is commented inline to make it easy to follow as a beginner.

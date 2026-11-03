# PATH

A website that helps students decide what to study by starting with what they
already love. Built with plain HTML, CSS, and JavaScript. No frameworks and no
build step.

**Flow:** three topics you are curious about -> a short survey about how you like
to learn -> study themes where your topics overlap -> a path you explore in any
order -> local places to keep learning -> progress you can track.

For example, a student who types *cats*, *history*, and *architecture* sees
"Ancient Egypt: Cats, Temples, and Pyramids" first, because it covers all three.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure and all the screens |
| `style.css` | All styling |
| `data.js` | **All the content**: survey questions, topic words, study themes, school subjects, local opportunities |
| `script.js` | App logic: matching, themes, progress, course ratings, skills web, login |
| `firebase-config.js` | Your Firebase project keys (see below) |

## Running it locally

Extract the files into one folder and double-click `index.html`. If
`firebase-config.js` still has placeholder values, progress saves in that
browser only and login is skipped, so it works out of the box.

## Accounts and cloud saving (Firebase)

1. Go to the [Firebase console](https://console.firebase.google.com) and create a project.
2. Register a web app (the `</>` icon) and copy its `firebaseConfig` values into `firebase-config.js`.
3. **Build > Authentication > Get started**, then enable **Email/Password**.
4. **Build > Firestore Database > Create database** (test mode is fine to start).

The API key in `firebase-config.js` is safe to commit. Access is controlled by
your Firestore rules, not by hiding the key. Before real students use the
site, tighten the test-mode rules so each user can only read and write their
own document.

## Deploying with Firebase Hosting

From inside the project folder:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # public directory = "."  (answer "No" to single-page app and GitHub builds; don't overwrite index.html)
firebase deploy
```

To update later, replace the changed files and run `firebase deploy` again.

## How matching works

- Each topic the student types is matched against the words in `INTERESTS`
  (`data.js`). "Egyptian history" becomes the interests *egypt* and *history*.
- Every theme in `THEMES` lists the interests it overlaps. Themes that cover
  more of the student's three topics rank higher.
- If no ready-made theme covers a topic, PATH builds a custom theme from the
  student's own words, so every topic gets something to study.
- The survey measures how the student likes to learn. It nudges themes toward
  that style and highlights threads that fit it. The student can always choose
  any theme and any thread.
- Course ratings (0 to 5) move themes up or down, scaled by how much each
  subject matters to that theme. Ratings never remove a theme.

## Customizing

All in `data.js`:

- **Add a study theme**: copy an entry in `THEMES`, give it a new `id`, list its `tags` (ids from `INTERESTS`), and write its threads.
- **Teach PATH new words**: add them to the `words` list of an interest in `INTERESTS`.
- **Survey questions**: edit `QUESTIONS`.
- **School subjects and web connections**: edit `COURSES` and `COURSE_LINKS`.
- **Local places**: edit `OPPORTUNITIES_BY_REGION`.

In `script.js`, `POINTS_PER_WEIGHT` and `MAX_COURSE_ADJUSTMENT` control how
strongly course ratings change the order of themes.

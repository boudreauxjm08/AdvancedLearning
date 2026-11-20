# Turning on PATH's AI

PATH's AI finds the connections between a student's topics, writes the lessons,
and gives feedback, all inside the app. It runs on a small Firebase Cloud
Function so your secret API key is never visible on the website.

Until you finish these steps, PATH still works. It just uses its built-in study
themes instead of AI-written lessons.

## What you need

- Your Firebase project (you already have one)
- An Anthropic API key
- The Firebase **Blaze** plan (pay as you go). Cloud Functions require it. It has a
  free monthly allowance, and you can set a budget alert.

## 1. Get an Anthropic API key

1. Go to the Claude Console at **platform.claude.com** and sign in.
2. Add billing or credits, and **set a monthly spend limit** so costs can never surprise you.
3. Open **API keys**, create a key, and copy it. You will paste it in step 5. Never put it in any website file.

## 2. Upgrade Firebase to Blaze

1. Firebase console, then click **Upgrade** (bottom left of the sidebar).
2. Choose **Blaze**, and add a billing account.
3. Set a **budget alert** (for example $5) when it offers.

## 3. Put the new files in your folder

Your PATH folder should now contain:

```
index.html   style.css   script.js   data.js   firebase-config.js
firebase.json   firestore.rules
functions/index.js   functions/lib.js   functions/package.json
```

Replace your old `firebase.json` with the new one. Keep your own `firebase-config.js` and your `.firebaserc`.

## 4. Install the function's tools (one time)

Open Command Prompt in your PATH folder (type `cmd` in the File Explorer address bar), then:

```
cd functions
npm install
cd ..
```

Warnings are fine. Errors are not. If you see a red error, copy it to me.

## 5. Save your API key as a secret

```
firebase functions:secrets:set ANTHROPIC_API_KEY
```

Paste your key when asked and press Enter. It is stored in Google's Secret Manager, not in your code.

## 6. Deploy everything

```
firebase deploy
```

The first time, Firebase may ask to turn on some Google services. Answer **Y**.
It deploys the website, the function, and the database rules together. Then
hard-refresh your site with **Ctrl+F5**.

## 7. Test it

1. Log in and start a new path with three topics, for example cats, history, architecture.
2. Finish the survey. "Finding where your topics connect..." appears for about 20 seconds.
3. Open a theme and click **Start lesson**. The lesson is written the first time you open it (about 15 seconds). After that it is saved.
4. Read, answer the 3 questions, write the short task, and watch the status change to Completed by itself.
5. Finish 3 lessons on the dashboard to unlock **Connect the dots**.

## Controls you have

- **Daily limit per student:** `DAILY_LIMIT` in `functions/index.js` (default 40 AI requests a day, counting themes, lessons, and feedback).
- **Max simultaneous requests:** `maxInstances` in `functions/index.js`.
- **Which model:** `MODEL` in `functions/index.js`. A smaller model costs less.
- **Lessons are saved**, so reopening one never costs anything.
- **Costs:** see Anthropic's pricing page. A theme set is one request, each lesson is one request, and feedback is one request.

## Safety and privacy

- Only logged-in students can use the AI. Request sizes are limited and cleaned on the server.
- Students' topics are passed to the AI as data, and it is told to refuse unsafe or inappropriate topics.
- Only the topics and survey angles are sent to the AI. PATH does not ask for, or send, a name, email, location, or school.
- Lessons are written by AI and can contain mistakes. PATH tells students to double-check surprises. A teacher reviewing the first few lessons is a good idea.
- If any students are under 13, or this is used in a school, check with the school about privacy rules (such as COPPA and FERPA) before launch.

## If something goes wrong

- **"AI lessons are not turned on for this site yet":** the function is not deployed. Run `firebase deploy` again and read any errors.
- **"billing account" or "Blaze" error:** finish step 2.
- **"Secret" or "ANTHROPIC_API_KEY" error:** repeat step 5, then deploy again.
- **"The AI is busy right now":** the API call failed. Check your Anthropic credits and spend limit.
- **Browser console errors about "functions":** make sure `index.html` has the `firebase-functions-compat.js` line (the new `index.html` does).

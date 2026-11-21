# Turning on PATH's AI (free, no paid plan)

PATH's AI finds the connections between a student's topics, writes the lessons,
and gives feedback, all inside the app. It uses Google's Gemini model through
**Firebase AI Logic**, which works on the free Firebase Spark plan. There is no
server to run, no credit card, and no API key in your code. Firebase keeps the
key for you.

Until you finish these steps, PATH still works. It just uses its built-in study
themes instead of AI-written lessons.

## 1. Turn on AI Logic in Firebase

1. Open your project in the Firebase console.
2. In the left sidebar, find **AI Logic** (it may be under an "AI" section) and click **Get started**.
3. Choose **Gemini Developer API** and follow the prompts. Firebase turns on what it needs and creates the key inside your project.
4. **Stay on the free Spark plan.** Do not link a billing account. The free tier only works while no billing account is linked.

## 2. Put the files in your folder

Your PATH folder should contain:

```
index.html   style.css   script.js   ai.js   data.js   firebase-config.js
firebase.json   firestore.rules
```

- `ai.js` is new. Replace your old `firebase.json` with the new one. Keep your own `firebase-config.js`.
- If you created a `functions` folder earlier, you can delete it. It is not needed anymore.

## 3. Deploy

Open Command Prompt in your PATH folder (type `cmd` in the File Explorer address bar) and run:

```
firebase deploy
```

Then hard-refresh your site with **Ctrl+F5**. This works on the free plan.

## 4. Test it

1. Log in and start a new path with three topics, for example cats, history, architecture.
2. Finish the survey. "Finding where your topics connect..." appears for about 10 to 20 seconds.
3. Open a theme and click **Start lesson**. The lesson is written the first time you open it. After that it is saved.
4. Read, answer the 3 questions, write the short task, and the status changes to Completed by itself.
5. Finish 3 lessons on the dashboard to unlock **Connect the dots**.

## Limits you should know about

- **The free quota is small and shared.** It is per Firebase project, not per student, so it is used up by everyone together. Check the current numbers on the Gemini API rate limits page in Google AI Studio, because Google changes them. Each theme set, each lesson, and each feedback is one request.
- When the quota runs out, students see "PATH's free AI limit for today has been reached." and everything resets the next day. PATH first tries a second, smaller model before giving up.
- Lessons are saved, so reopening one never uses quota.
- **A courtesy cap per student:** `AI_DAILY_LIMIT` in `script.js` (30 requests a day). It is saved with the student's data, so it is a guardrail, not a hard lock.
- Before sharing the site widely, look in the AI Logic settings for App Check and rate limits and turn them on.

## Privacy

- On the free tier, Google's terms say prompts and answers may be used to improve its products. Read the current terms before launch.
- Only the student's topics, their survey angles, and the text they write for **Connect the dots** are sent. PATH does not send names, emails, or anything else. Students are told not to type personal details.
- The free tier may not be allowed for users in some regions (for example the EU, the UK, and Switzerland). Check the terms.
- Do not use this with students under 13 or in a school without approval. A teacher should review the first few lessons.
- Lessons are written by AI and can contain mistakes. PATH tells students to double-check surprises.

## If something goes wrong

Press **F12** in your browser and open the **Console** tab to see the exact error.

- **"AI lessons are not turned on for this site yet":** AI Logic is not turned on, or the key is blocked. Redo step 1.
- **"free AI limit for today has been reached":** the shared quota is used up. Try again tomorrow.
- **"could not load its AI tools":** check your internet connection. If it keeps happening, the `SDK_VERSION` line at the top of the browser section in `ai.js` may be out of date. Check Firebase's docs for a current web SDK version and change it.
- **"model not found" in the console:** Google renamed or retired a model. Update the `MODELS` list in `ai.js` using Firebase's list of supported models.

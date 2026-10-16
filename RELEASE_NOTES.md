# Release notes · Nutrition (nutrition.mcbflow.com)

Newest first. One entry per release, in plain words a user would understand.

## 1.9 · 2026-10-16
- New Settings page with everything in one place, in the same order as the other mcbflow.com apps: Appearance, Account & sync, Nutrition settings (daily targets and drink units), Personalized targets, Tracking (fasting, supplements, caffeine, brand search, alcohol), Diet & allergies, Backup & data, Install and About.
- An account button in the top bar: "Sign in", or your initial with a sync dot once you're signed in. New "Keep me signed in on this device" option; turn it off on a shared computer and you're signed out when the browser closes.
- New welcome screen, the same look as the other apps: what the app does, pick a look, set your daily targets (calories, protein, hydration and drink units), then start logging. "Sign in to sync" and "Import a backup" are on it for moving from another device.
- Clearer Data menu: every item has a one-line description. New Export All (ZIP): your full backup plus spreadsheets of your log, foods, drinks and supplements in one file. Import Backup reads the ZIP as well as the JSON. The CSV is still the log only, for spreadsheets.
- Quieter backup reminders while you're signed in and syncing: the backup chip says "Synced" and the Data button loses its amber dot.
- Every page ends with the same short footer: What's new, Privacy, Terms and More free apps. What's new opens these notes in the app.
- Top bar controls are all the same height, and the name now reads "Nutrition ∙ mcbflow.com" ("Nutrition" on phones). The version line under the name was behind (it said 1.7); it now matches.
- Your profile picture and screen name: choose them under Edit profile in the account dialog or on the Settings card. They show on the account button and in every mcbflow.com app you sign in to.
- A short greeting on Home ("Good morning", with your first name when you're signed in).
- The first tab is now called Home, and Settings has a gear icon. The day itself is still headed "Today".
- Alcohol: log when you started or finished a drink and how long it took, for a steadier estimate. When you log an alcoholic drink, a small "When?" choice appears (Just started, Just finished or Earlier…) with how long it takes. The BAC estimate spreads that drink over that time, so the peak comes later and lower; it still clears at the same rate. Settings → Tracking has "Average time to finish a drink" (20 minutes to start; shots count as 1 minute). Drinks logged before this update are counted as before. The CSV has a new "drink_minutes" column.
- Fix: on touchscreens, the first tap on a Week bar now shows its numbers and a second tap opens that day (the first tap used to jump straight to the day). The charts look the same.

## 1.8 · 2026-10-15
- New: optional sync across devices. Data → Sync signs in with a free mcbflow.com account; your log, foods, drinks, recipes, supplements, usual day, targets and settings then match on every device you sign in on. Theme stays per device.
- Everything still saves on this device first and works offline. Not signed in: nothing changes, and no account server is contacted.
- Clear all data warns when you're signed in, since it also clears synced data.

## 1.7 · 2026-10-14

- Moved to nutrition.mcbflow.com. Data saved at the old address doesn't carry over: export a backup there and import it here. Storage names simplified.

## 1.6 · 2026-10-14

- The Week charts are easier to read: light gridlines with values on the side, a labelled target line, short day names (Thu, Fri…) instead of single letters, and rounded bars. While you read one bar, the others fade back.
- The BAC chart shows its scale (0.02%, 0.04%…) along the gridlines.
- Links inside dialogs, like "Open Food Facts" on a brand product, now use the app's green instead of the browser's default blue.
- On phones, the line under "Today" (date, items logged, calories) wraps between its parts instead of in the middle of one.

## 1.5 · 2026-10-14

- Editing a log entry now ends with a "Your library" choice: change only this entry, also update the saved food or drink, or save it as a new one in your library.
- The live "now" marker on the BAC chart is a clean ring with a soft glow. It stays round at any screen width and sits exactly on the line, as does the peak dot.
- Week charts say "Hover or tap a bar" so it's clear they're interactive.
- New releases now show up on the next page load: the app always checks the server for its files instead of using an old copy.

## 1.4 · 2026-10-14

- Brand results can be edited before you log them: open "Edit name or numbers", fix anything, and save it as your own food or drink. Your changes scale when you change the amount.
- Logged something that isn't in your library (from brand search, the food database or quick calories)? Edit the entry and tick "Save as my own" to keep it.
- New food and New drink have "Find it online": search Open Food Facts, then Customize (fills in the form so you can change it) or Save as is (keeps a copy on this device, so it works with no internet).
- The BAC chart has a new look in the app's green: a soft gradient, a pulsing "now" dot, the peak marked, and the projected part shown faded and dashed.
- The Week bars are interactive: hover, tap or tab to a day to see its total and how far it was from your target, then click (or tap again) to open that day. The calorie ring, macro bars and water glass on Today show their numbers the same way.

## 1.3 · 2026-10-14

- Brand search: when you log food, tap **Search brands online** to find packaged and restaurant products (like Pabst Blue Ribbon or Stouffer's Swedish Meatballs) from Open Food Facts, a free volunteer database. Pick one, choose how much, and it's saved to your foods or drinks so it's instant and works offline next time.
- Drinks found this way count toward hydration (and alcohol, if you track it). Under 21, alcohol products don't show.
- Brand search only runs when you tap the button, and only sends what you typed. You can turn it off in Settings. The privacy page explains it.
- If you search very quickly (about 10 searches in a minute), the app asks you to wait a few seconds. Your saved foods and the built-in database keep working.

## 1.2 · 2026-10-14

- If your age in Settings is under 21, everything about alcohol is hidden: beer, wine and spirits in your drinks and in food search, the alcohol total, the BAC chart, the Track alcohol switch and the alcohol notes on the Help page. Drinks you already logged stay in your history.
- New macro colors shared with Meal Prep: protein red, carbs blue, fat gold. The fat part of the split bar now shows its own color instead of green.

## 1.1 · 2026-10-14

- Food search understands everyday names now: "coke", "pepsi", "pop", "oj", "hot dog", "fries", "donut", "mac and cheese" and many more find the right foods. Plurals, small typos ("chiken", "brocoli") and half-typed words work too, and the most common pick (whole milk, a whole egg, brewed coffee) comes first.
- The same smarter matching applies to your own saved foods and drinks.
- The alcohol total on Today now reads "drinks" instead of an abbreviation. The CSV column is now alcohol_drinks.
- The live BAC chart is interactive: hover, drag a finger along it, or focus it and use the arrow keys to read the estimate at any time. Times after now are marked as projected.

## 1.0 · 2026-10-14

First release in the mb app family style. Earlier internal builds (service worker cache v5) had no version number on screen.

- New look that matches the other mb apps: avocado-green accent, a new avocado logo, a sidebar on computers and a bottom bar on phones, and light or dark mode (it opens light unless you picked dark).
- New Data menu at the top: Save backup now (Ctrl+S), Export All (JSON), Import Backup (JSON), Export All (CSV) and Clear all data. In Chrome and Edge you can pick one backup file and Save backup now keeps it up to date.
- A backup status chip shows when you last backed up, and a dot on Data means a backup is due.
- Importing a backup now shows what's in it and lets you Merge (skips anything you already have) or Replace. Importing the same file twice no longer matters.
- If this browser stops saving (private mode, full storage), a banner says so and offers an export.
- New Help page with common questions and the sources and methods behind the numbers.
- Share a hydration day or a summary of your week as an image. Amounts stay off the card unless you turn them on.
- Install card and About card at the bottom of Settings. Press / to search foods from anywhere.
- A short welcome screen for first-time visitors (shown once).
- Fixed: a duplicated "Daily targets" box in Settings; imported backups are checked before anything is shown.
- The app no longer loads fonts from Google; it uses your system font and makes no outside requests.
- Your existing log, foods, drinks, recipes, supplements and settings carry over unchanged (same storage key). Data saved by older builds under the previous keys is still read, and a copy of it is kept.

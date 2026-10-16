# Attributions · Nutrition (nutrition.mcbflow.com)

Made by Matthew Broyer. App code, icons, logo and OG image are original work unless listed below.

## Data shipped in the app

| Item | What it is / what the app uses it for | License or terms | Source |
|---|---|---|---|
| USDA FoodData Central, SR Legacy | About 7,200 foods in `foods-db.json` (calories, protein, carbs, fat per 100 g) | Public domain (U.S. government work), as stated in `foods-db.json` and on the Help page. Not re-checked against the USDA site in this run. | https://fdc.nal.usda.gov/ |
| TempoLife food nutrition dataset | About 560 extra everyday foods in `foods-db.json` | CC BY 4.0 as stated in `foods-db.json`; attribution shown on the Help page. **Unconfirmed**: the dataset's own license page wasn't found in this run; Matthew to confirm the source and license. | https://tempolife.app |

## Online service (called only when the user taps it)

| Item | What it is / what the app uses it for | License or terms | Source |
|---|---|---|---|
| Open Food Facts | "Search brands online" in the log sheet sends the typed words to `world.openfoodfacts.org/cgi/search.pl` (falls back to `search.openfoodfacts.org/search`) and shows matching packaged products | Database: Open Database License (ODbL); attribution shown in results ("OFF" tag), on the Help page and in the privacy page. Their API docs ask for about 10 searches/min per user max; the app stops at 9. **Not live-tested in this run** (the build environment couldn't reach their servers). | https://world.openfoodfacts.org |

## Links only (nothing loaded or called)

The Help page links to these as citations. The app never contacts them; they open only if you tap the link.

| Item | What it is | Source |
|---|---|---|
| doi.org | Links to research papers (Maughan 2016, Mifflin 1990, Feinman 2015) | https://doi.org |
| pubmed.ncbi.nlm.nih.gov | ISSN protein position stand | https://pubmed.ncbi.nlm.nih.gov |
| www.fda.gov | Caffeine guidance, major food allergens | https://www.fda.gov |
| www.nationalacademies.org | Water intake reference | https://www.nationalacademies.org |
| www.niaaa.nih.gov | Standard drink definition | https://www.niaaa.nih.gov |
| www.wisdoj.gov | Alcohol monograph (elimination rate) | https://www.wisdoj.gov |
| mealprep.mcbflow.com | Matthew's own app; the body-type splits and calculator setup were adapted from it | https://mealprep.mcbflow.com |
| matthewbroyer.com | Matthew's hub site (About card link) | https://matthewbroyer.com |

## Suite files

`mb-suite-*.css`, `mb-install.js`, `mb-share.js`, `mb-title.js`: MB Suite theme kit (2026-10-14), Matthew Broyer's own work. Nature art NA-17 "Fresh Drops" was added to the kit for this app.

Last reviewed: 2026-10-14

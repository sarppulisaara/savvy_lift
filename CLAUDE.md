# Savvy Lift

Repo: sarppulisaara/savvy_lift. React + Vite PWA.
Julkaisu: `npm run push` (commit + push + gh-pages deploy).

## Tärkein sääntö

**Historia ei saa mennä rikki.** Suosituslogiikka vain lukee historiaa, ei koskaan muokkaa sitä.

## Data

Google Sheet "Form_Responses" (ID `11DfpL-t4T65tppp-WDm-JvBNlq1xXzuhWWNg3J61uao`),
Apps Script `doGet`/`doPost`.
Sarakkeet: Aikaleima, workoutType, musclegroup, exercisename, s1_reps..s5_weight, notes.

**Apps Scriptiin ja sarakkeisiin EI kosketa.**

## Kirjauskäytännöt

- Käsipainoliikkeet: aina paino PER KÄSI.
- Aikaliikkeet (Lankku): sekunnit tallennetaan toistosarakkeeseen, appissa kirjoitetaan `1:24` / `45`.
- Kehonpainoliikkeet (Dead Bug, Jalkojen nostot selinmakuulla, Vatsarutistus jumppapallolla, Voimapyörä): paino-sarake tyhjä, ellei lisäpainoa.
- Lat Pulldown -nimien vaihtelua alkuvuodesta ei korjata.

## Koodin rakenne (src/)

- `recommendation.js`: tuplaprogressio (nosta kun kaikki työsarjat haarukan yläpäässä, kevennä kun 2 kertaa alle haarukan, tauko >14 pv → ~90 %), tarkka nimihaku, aikajärjestys.
- `exerciseTypes.js`: liiketyypit (weight / bodyweight / time) + ajan parsinta.
- `stats.js`, `WeekView.jsx`, `ProgressChart.jsx`: viikkonäkymä, kehityskäyrä, muistiinpanot.
- Historia välimuistissa localStoragessa (`savvy_lift_history_cache`), päivittyy taustalla.

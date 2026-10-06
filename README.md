# PJPK · Studio Peperiksaan

A mobile-friendly Malay exam builder for the 495-item KSSM PJPK bank, Forms 1–5.

Idea by: **Khairul Adham**  
Created by: **Izzul Waqiuddin Azhad**

## Teacher workflow

1. Filter by form, estimated difficulty, topic, or Bloom level.
2. Set a target (for example, 50 questions) and select individual items.
3. Review the selection, reorder or remove questions, and fill in exam details, optionally upload a school logo (PNG/JPEG, up to 5 MB), and enter reviewer/approver names.
4. Confirm to generate separate student-paper and teacher-scheme PDFs.

The student PDF has an optional cover with a proportionally fitted school logo and separate dotted signature lines for Disediakan oleh, Disemak oleh and Disahkan oleh, sequential numbering, original monochrome diagrams, response boxes, and page numbers. The scheme has the same paper code, a compact answer key, rationales, Bloom levels, and textbook/DSKP topic references. Questions are kept together across page breaks. All items carry one mark.

## Run locally

No build step or npm dependencies are required. Serve `dist/` through HTTP:

```sh
npm run serve
```

Open `http://localhost:8080`. Do not open `index.html` using `file://` because the bank is loaded with `fetch`.

## Checks

Requires Node.js 20+ and Python 3 for the optional local server.

```sh
npm run check
npm test
```

Tests check the bank's 495 unique IDs and answer keys, intersecting filters, duplicate/invalid selection rejection, ordering, and a 50-item PDF containing every diagram-bearing question. The generated test PDFs go to ignored `test-output/`.

## Hosting

Deploy the contents of `dist/` to a static web host. All asset paths are relative, so a GitHub Pages repository subpath is supported without changing source. There is no server, API key, analytics, CDN dependency, or paid service required for PDF generation. The root index redirects to the app in `dist/`. GitHub Pages can publish directly from the `main` branch and `/ (root)` folder. In repository Settings → Pages, select Deploy from a branch, then main and / (root).

## Data and privacy

- `dist/assets/bank.json`: original question bank, 99 topic groups and 495 questions.
- `dist/assets/Rajah_*.png`: original black-and-white diagram stimuli.
- `dist/core.mjs`: filtering, selection validation and ordering.
- `dist/pdf.mjs`: pagination, paper and answer-scheme generation.
- `dist/app.mjs`: interface and device-local draft state.
- `dist/vendor/pdf-lib.min.js`: vendored pdf-lib (MIT; license included).

Drafts are stored in localStorage on the current browser. School/teacher details, uploaded logos and exam selections are processed locally; they are not sent to an application server. Downloads require a user click after generation.

This is a **teacher workspace**, not a secure student testing system. The question bank includes answers in a downloadable static asset. Anyone with access to the hosted site or source can read them. Protect the hosting audience and repository as appropriate before sharing.

## Curriculum scope

The supplied bank and diagrams are preserved from the original question-bank package. Textbook page references identify topic ranges supporting the concepts; they are not exact per-item quotations. SK references are mapped at topic level, not to every SP. Difficulty and Bloom labels are design judgments and should be reviewed using pupil response data before high-stakes use. Source textbook and DSKP links are available on each item.

## Validation record

- Filter/selection unit tests passed.
- 50-item paper containing all 24 diagram-bearing items generated and visually checked.
- Matching answer scheme, unique item IDs, consistent paper codes, and page boundaries checked.
- Maximum-length exam headings/instructions and cover/no-cover exports checked.
- JavaScript syntax and local asset references checked.
- Interactive browser QA was unavailable in the creation environment; desktop and mobile layouts still need a real-device acceptance pass.
- Optional WebMCP registration is feature-detected. Its structured filter/selection tools share the same state/actions as the interface; a supported browser context was unavailable for WebMCP execution validation.

## Updating the bank

Keep IDs stable and every item to four unique choices with `options['ABCD'.indexOf(answer)] === correct`. Each question inherits its form, topic, source ranges and applicable diagram from its topic. Run `npm test` after changes; update aggregate expectations if the bank's intended size or classification changes.

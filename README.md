# PJPK · Studio Peperiksaan v2

A Malay-language, mobile-first exam builder for **Tingkatan 2–5**.

Idea by: **Khairul Adham**  
Created by: **Izzul Waqiuddin Azhad**

## Bank and evidence

- **240 new textbook-backed questions:** 60 per form, covering 12 topic groups per form, five questions per group.
- **390 earlier questions:** retained separately with a `Semakan diperlukan` label. They are hidden by default and have topic-range references rather than audited page evidence.
- **630 total questions in 78 topic groups.** The new evidence-backed set covers 48 groups, not every topic in the syllabus.
- Every new item has four options, one keyed answer, a rationale, exact printed/PDF textbook pages, source edition/ISBN and a page preview. The 48 previews are excerpts from the textbooks supplied for this project; full textbooks are not included.
- Related DSKP standards and printed pages were checked at **topic level**. They are curriculum context, not a claim that a written MCQ measures physical performance or demonstrates mastery of every listed SP.
- Bloom and difficulty are separate editorial classifications. Difficulty has not been calibrated with pupil response data. Teachers should review the assembled paper for taught content, balance and ambiguity before use.
- Twelve new original outline diagrams complement the earlier diagram assets. Student papers use black-and-white graphics suitable for photocopying.

## Teacher workflow

1. Choose a form using the boxes above the question bank. Select topic, Bloom (all levels by default) and estimated difficulty as needed. Collapse the filters to give questions more space.
2. Select questions manually, or choose **Jana pilihan automatik**. Set a target and percentages for Rendah / Sederhana / Tinggi. Percentages must total 100%.
3. The default 50-item mix is **10 rendah, 30 sederhana, 10 tinggi**. The new set supports this mix separately for each form. Small totals use largest-remainder rounding so the counts always add up exactly.
4. The generator uses the current filters, balances topic coverage, and avoids repeated IDs. Retaining existing selections is optional. If a quota cannot be met or retained questions conflict with the filters, the original selection is preserved and a message explains the problem.
5. Review, reorder or remove questions. Enter school/exam details, upload an optional PNG/JPEG school logo (maximum 5 MB), and enter names plus custom **jawatan** for Disediakan oleh, Disemak oleh and Disahkan oleh.
6. Generate and download the student paper and teacher scheme separately. Optionally include textbook previews in the teacher PDF. Each source page appears once, even if several selected items use it.

The A4 student PDF includes an optional cover, separate dotted signature lines, names with roles underneath, sequential numbering, diagrams, response boxes and page numbers. The scheme includes answers, rationales, Bloom/difficulty labels, textbook references, related DSKP pages and an optional source appendix. Both PDFs share an exam code. Question blocks stay together across page breaks.

## Run locally

No build step, server-side API or npm runtime dependencies are needed.

```sh
npm run serve
```

Open `http://localhost:8080`. Do not open the HTML directly with `file://` because the bank is loaded using `fetch`.

```sh
npm run check
npm test
npm ci
npm run test:ui
```

Requires Node.js 20+; Python 3 is used for the optional development server. The optional DOM workflow test uses the development-only happy-dom dependency (`npm ci`). Test PDFs are written to ignored `test-output/`.

## GitHub Pages

Publish the `main` branch and `/ (root)` in repository Settings → Pages. The root HTML redirects to `dist/`, and all app asset paths are relative.

Live URL: https://izzulwaqiuddinazhad.github.io/pjpk-exam-builder/dist/

For a manual update, upload the contents of the release's `UPLOAD` folder to the repository root and commit. Do not upload the surrounding release folder or the ZIP itself. Existing unchanged files, including the PDF library and earlier diagram assets, remain necessary.

## Files and rebuilding

- `dist/assets/bank.json`: publishable question data and topic-level curriculum references.
- `dist/assets/evidence/*.jpg`: textbook-page previews used in the teacher view and optional appendix.
- `dist/assets/Rajah_*.svg` and `.png`: original question diagrams.
- `dist/core.mjs`: filters, quota allocation, selection and ordering.
- `dist/app.mjs`: interface and local draft storage.
- `dist/pdf.mjs`: student and teacher PDF generation.
- `authoring/t2.json` through `t5.json`: editable source for the new questions.
- `authoring/source-map.json`: source-file names, checksums and textbook page mappings.
- `authoring/curriculum-map.json`: reviewed DSKP topic context and source links.
- `build_bank.py`: rebuilds new questions and page previews from the supplied PDFs under `../upload/`; requires PyMuPDF and Pillow.
- `finalize_bank.py`: attaches curriculum context and invokes the diagram generator; automatically called by `build_bank.py`.
- `make_diagrams.py`: creates the twelve original SVG/PNG diagrams and attaches their stimuli to question IDs.

Use the original textbook PDF filenames beginning `01-` (T5), `02-` (T4), `03-` (T3), `04-` (T2). Tingkatan 1 is excluded. Keep complete textbooks outside the repository. Running `python3 finalize_bank.py` is sufficient when only curriculum mapping or diagram generation changes.

## Validation and limits

Automated checks cover stable unique IDs and answer keys, form/topic/Bloom/difficulty intersections, evidence-image existence, curriculum-reference presence, exact quota rounding, a balanced 50-item paper for each form, topic coverage, preservation/shortage errors, all twelve new diagrams in PDF export, optional appendix page deduplication, matching paper/scheme codes and long signature/name/role fields. Generated PDF pages are visually reviewed.

DOM workflow tests passed. Headless Chromium checks passed at 320 px, 390 px and 1440 px widths: no horizontal overflow, successful PDF generation/download, and draft restoration after reload. Screenshots of the filters, questions and generator were visually checked. Physical-device Safari/Chrome and printer-specific behavior still depend on the target device.

The site is a **teacher workspace**, not a secure student examination system. Answers are in the public static question-bank file. School details, uploaded logos and drafts are processed locally in the browser; they are not sent to an application server. Drafts persist only on the current browser/device. Evidence previews load from the same static site; external textbook/DSKP links open only when clicked.

`dist/vendor/pdf-lib.min.js` is vendored under its included MIT license.

# parker-site

Single-page immersive site for [Mycilia](http://myciliaai.com) — a tree of knowledge
above ground, a descent through its roots below, one message per junction.

## Layout

- `index.html` — the entire site. Self-contained: no build step, no external
  requests. Inline CSS/JS, system fonts, procedural artwork, and a vendored
  anime.js v4 bundle (MIT) driving the entrance, reveal, and root-drawing
  animations. Ambient loops (mote pulse, falling leaves) stay in CSS.
- `tools/generate_tree.py` — generates the hero tree (space colonization, seeded).
  Regenerate with `python3 tools/generate_tree.py 7 out/` and splice the resulting
  `tree_fragment.svg` into the hero `<svg>` in `index.html`. Seed 7 is the shipped tree.
- `preview/structure-preview.html` — the early content/structure mock (kept for history).
- `SITE_RECON.md` — reconnaissance report over `mycilia_core` that the site's copy,
  claims, and guardrails are built from. Read §8 before changing any copy.

## Known gaps (by design, pending supply)

- The floor CTA has no destination yet — no contact email or booking link exists.
- Trace/replay glimpses are marked "illustrative" until real recorded fixtures are
  generated from `mycilia_core` and committed.
- Canonical domain (myciliaai.com vs mycilia.ai) unconfirmed.

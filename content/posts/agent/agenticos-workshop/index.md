---
title: "The Agent Stack Was Designed for the Wrong Workload"
date: 2026-05-10
author: "guanlan"
tags: ["Agent","Infra","Execution"]
images: ["cover.png"]
description: "LLM inference is only 30 to 40 percent of agent latency. Peak-to-average resource ratio hits 15x. We are running $40,000 GPUs to wait on disk I/O, and that is just the surface of why the infrastructure agents run on today was built for the wrong workload."
---

**We are using $40,000 H100s to wait on the cheapest possible disk I/O.** That was the sentence I could not get out of my head after AgenticOS Workshop at ASPLOS 2026. GTC had the industry staring upward at bigger GPU stacks. AgenticOS forced the opposite question: what exactly are those GPUs waiting on?

The obvious counter is that modern deployments already separate inference and tool execution. GPU clusters are pooled, and while one agent is waiting on its tools, the GPU is free to serve another request. In theory, the H100 never actually sits idle.
In practice it is messier. Agent sessions accumulate a lot of KV cache across turns, so switching a GPU between agents means offloading and swapping that cache, which is itself an expensive operation. This is not stateless HTTP request pooling. It is stateful context switching. Even under separated deployment, the GPU side carries its own state-management cost, and inference cannot be treated as a stateless service you can opportunistically slot work into.

The Eunomia-bpf team brought hard profiling data. They ran 144 SWE-bench tasks through Claude Code with full OS-level instrumentation:

{{< image src="image.png" alt="AgentCgroup resource profile" caption="*[AgentCgroup](https://os-for-agent.github.io/papers/AgenticOS_2026_paper_10.pdf): Understanding and Controlling OS Resources of AI Agents, by Yusheng Zheng, Jiakun Fan et al.*" >}}

Run the same task three times, and execution time varies by 1.8x. The three runs produced different solutions, different code changes, different files altogether. LLM inference accounts for only 30% to 40% of end-to-end latency. The other 60% to 70% goes into tool execution and environment setup: running tests, installing dependencies, executing scripts. Average CPU utilization stays under 13%. Memory peaks at 4GB. Peak-to-average ratio: 15.4x. For comparison, serverless is around 1.5x, microservices 2 to 3x.

The numbers changed the framing for me. What the numbers really showed is that agents don't behave like the workloads we have infrastructure for. They branch, they have side effects, and they spike unpredictably.

### Branching isn't just state isolation

Traditional infrastructure assumes workloads are roughly predictable, and that historical patterns can guide future scheduling. Agents break that assumption.

BranchContext goes after state management during parallel exploration. When an agent tries three different ways to fix the same bug, each path modifies files, installs packages, runs tests. You need to isolate the side effects, then atomically commit the one that wins.

{{< image src="image-1.png" alt="BranchContext fork explore commit" caption="*[Fork, Explore, Commit](https://os-for-agent.github.io/papers/AgenticOS_2026_paper_8.pdf): OS Primitives for Agentic Exploration, by Cong Wang and Yusheng Zheng*" >}}

Their abstraction is the *branch context*: a copy-on-write filesystem view plus a controlled process group, with a fork/explore/commit lifecycle and first-committer-wins semantics. One design trade-off I liked: while branches exist, the parent process becomes read-only, a *frozen origin*. This rules out merge conflicts by construction, at the cost of the parent doing nothing during the wait. For agent workloads I think this trade-off is fine, because the parent isn't really doing useful work anyway. It is just waiting to see which branch produces something worth committing.

The Q&A turned out to be more interesting than the paper itself. One question was about how to decide which branch to commit. Today it relies on external scoring: in Best-of-N mode each branch gets a score and the highest wins; in beam-search mode you can use hierarchical feedback from the tree structure. The authors acknowledged scoring has no good general answer. I went in thinking BranchContext was about state isolation. The live discussion changed my mind. BranchContext is not mainly a filesystem primitive. It is a token-budget primitive hiding behind a filesystem primitive. Branch exploration is speculative execution, except the scarce resource is not CPU. It is tokens, wall-clock time, and permissioned side effects. Without an economically aware execution layer, parallel exploration will burn tokens at a rate you can't control.

They use these primitives to express seven exploration patterns: parallel speculation, BestOfN, Reflexion, TreeOfThoughts, BeamSearch, Tournament, Cascaded. Reflexion as a special case of single-branch sequential retry is the one I keep coming back to. The same branch primitive can describe both parallel exploration and sequential retry-with-rollback.

### The agent should not own the keys

Once agents can touch real systems, capability can no longer live inside the agent process.

{{< image src="image-2.png" alt="Execute-Only Agents architecture" caption="*[Execute-Only Agents](https://os-for-agent.github.io/papers/AgenticOS_2026_paper_21.pdf), by Rahul Tiwari and Dan Williams*" >}}

Execute-Only Agents takes the most radical line: the LLM never touches untrusted data. The LLM only generates scripts; the scripts run in a sandbox and interact with the data; results go directly to the user. They found that 78% of AgentDojo tasks can be completed without the LLM ever seeing the data. That removes prompt injection from the attack surface at the architecture level.

I don't think this pattern covers every agent workload. But it is a useful extreme: if the model does not need to see the data, don't let it see the data.

{{< image src="image-3.png" alt="Grimlock eBPF and attested channels" caption="*[Grimlock](https://os-for-agent.github.io/papers/AgenticOS_2026_paper_23.pdf): Guarding High-Agency Systems with eBPF and Attested Channels, by Qiancheng Wu, Wenhui Zhang et al.*" >}}

Grimlock, from Roblox, pushes infrastructure downward. eBPF intercepts every network request at the sandbox boundary, forces it through mTLS, and authorizes it with short-lived scoped tokens backed by TEE remote attestation. The security boundary moves out of application code and into infrastructure the agent can't bypass. In the Q&A the authors drew a useful line. Hard boundaries, like no root or no access to certain resources, are independent of what the agent intends, and can be defined cleanly. Soft boundaries, where permissions adjust dynamically based on what the agent is currently doing, still have no good solution.

{{< image src="image-4.png" alt="LLM-driven rule generation" caption="*[Toward LLM-Driven Rule Generation for Enforcement Systems](https://os-for-agent.github.io/papers/AgenticOS_2026_paper_24.pdf), by Quanzhi Fu and Dan Williams*" >}}

VibeWAF takes the online-learning path: an LLM evolves WAF rules in real time. A fast rule engine handles known patterns; unmatched traffic goes to the LLM, which analyzes it and generates new rules; over time the LLM gets offloaded as the rule set grows. The feedback loop does converge, with hit rate climbing from 0% to 88%.

Allowlist rules converge well, because attack patterns share structure. Blocklist rules barely converge, because normal traffic is too diverse. More dangerously, an allow-rule generated early can silently pass malicious traffic when a new attack appears. The request gets matched by the rule engine, so the LLM never sees it, and never gets a chance to correct itself.

I am not bullish on online-learning for allow rules because of this: you are exposing the learning interface itself to the attacker. Every allow rule the system learns becomes a potential future channel an attacker can walk through. Once those rules get cached in the rule engine, even the chance to self-correct disappears. I am not ready to put that mechanism at the foundation.

Hard boundaries should stay deny-by-default and be enforced at the infrastructure layer. Soft boundaries can be explored, but the fallback should still be deny. Don't expect the agent to converge to a safe boundary on its own.

### Kill-and-restart breaks once the agent has memory

A 15.4x peak-to-average ratio means agent resource consumption is fundamentally different from traditional workloads. Bursts come mostly from tool calls. They last 1 to 2 seconds. The trigger timing is unpredictable. Traditional elastic scaling assumes load changes gradually and predictably. For agents, that assumption does not hold.

Fault tolerance is harder still. Traditional cloud infra treats kill-restart as an acceptable form of degradation. But killing an agent container means losing all the LLM context. After restart the agent takes a completely different path. There is no guarantee it converges to the same solution.

There is an unresolved tension here. On one side, kill-restart being unacceptable means we need Checkpoint/Resume to protect execution continuity, which is expensive. On the other side, BranchContext pulls us toward a probabilistic fault-tolerance model. If paths are non-deterministic anyway, why spend resources preserving the exact state of one path when you can just open a new branch and retry?

Long-running tasks fit checkpoint. Early-stage exploration fits fork-and-retry. A SWE-bench task that has been running 20 minutes has accumulated valuable intermediate state, and checkpointing it is worth the cost. A short task still in early exploration is cheaper to just fork and retry. The execution layer should surface enough information for the upper layer to make that call, and leave the choice to the scheduling policy.

### Prompts are the wrong place to hide mechanisms

{{< image src="image-5.png" alt="Declarative model interface" caption="*[Rethinking OS Interfaces for LLM Agents](https://os-for-agent.github.io/papers/AgenticOS_2026_paper_9.pdf), by Yuan Wang, Mingyu Li and Haibo Chen*" >}}

The Declarative Model Interface paper from the Institute of Software, CAS gives this idea a clean quantitative validation. They design a declarative OS interface for LLM agents that models GUI navigation as a deterministic graph. The LLM only declares the target state; the DMI layer handles navigation and interaction. On Microsoft Office tasks, success rate goes from 44.4% to 74.1%, steps drop by 43.5%, and 61% of successful tasks finish in a single LLM call.

A lot of what we cram into the prompt today should not actually be left for the model to guess. The model is better at semantic decisions. But navigation, interaction, state transitions, once pulled out of the prompt and exposed as explicit system interfaces, make the whole system lighter and more stable.

IBM Research's FMOS paper points in the same direction: take part of the context, policy, and reasoning scheduling out of the prompt and turn them into well-defined system interfaces. Whether FMOS is closer to an OS or to a framework was actually disputed in the room. But it makes the same point in a different way: the less mechanism we leave for the model to guess, the more efficient and controllable the system becomes.

### The missing piece

Across the workshop, almost every piece of work sits inside the Linux ecosystem: eBPF, cgroup v2, sched_ext, FUSE. Linux as a substrate for low-level mechanisms is still very strong. Processes, networking, isolation, resource control, the basic building blocks have not aged out.

What is missing between these projects is a shared coordination layer. BranchContext creates parallel universes at the filesystem level, but the scoped tokens Grimlock issues have no concept of branches. Once a branch is abandoned, how do you immediately revoke its permissions? Branch exploration and capability authorization are completely disconnected. When a scoped token needs to talk to the scheduling policy to decide whether to checkpoint, the coordination cost itself becomes the bottleneck. Under a 15x peak-to-average load with completely divergent paths, piling local patches onto Linux will not close these gaps. These patches need a native execution layer to coordinate them.

Just as virtualization gave rise to the hypervisor, and containerization gave rise to Kubernetes, agent workloads need a system substrate that natively understands non-deterministic branching and semantic-level security.

The forcing function for the hypervisor was hardware-assisted virtualization maturing. The forcing function for Kubernetes was the Docker ecosystem exploding. Both were a single clear technical inflection point. The forcing function for the agent execution layer is different. It is several pressures tightening at the same time: tasks are getting longer and more branched; tokens are not yet cheap enough to throw around freely; once real permissions are in play, the cost of a single security incident climbs sharply.

Stack those three on top of each other, and continuing to patch Linux locally will quickly become more expensive than building one coordinating layer.

Academia is doing the right thing here: proving the local primitives. But a product has to own the coordination between them. From BranchContext to Grimlock to DMI, every paper proves the agent execution layer needs to support some specific capability, and in the same breath, proves that you can't stitch a complete system together from the implicit coordination between papers.

Branching, capability, scheduling, rollback, and token budget are being solved one at a time, each as its own Linux-local patch. But agents don't fail one mechanism at a time. They fail in the seams between them.

That seam is the product surface.

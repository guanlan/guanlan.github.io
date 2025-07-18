---
title: "Random Thoughts Series 1 - C++ Thoughts"
date: 2009-12-20 00:00:00+08:00
draft: false
categories: ['C++']
tags: ['Original']
author: "guanlan"
---

After diving deep into the internal structure of STL and some of the deeper mechanisms and techniques of C++, a question that every programmer must face suddenly emerged.

**Why Programming in C++?**

Why should I choose C++ over the simple and pure C, or the flexible and comprehensive JAVA and C#?

Browsing through various technical forums and blogs of experts, everyone is arguing for their favorite language. C#/JAVA programmers say: don't reinvent the wheel, with a good language platform and rich comprehensive libraries, you can focus on more important aspects like architecture and software engineering. Why be obsessed with the surface foundations of the language? The C++ standard doesn't even have basic GUI libraries and network libraries. Even BJ, the creator of C++, wants to develop C++ into a platform.

C++'s STL library is admittedly good, but when a novice uses STL, a small error can trigger thousands of lines of compilation errors (even with STLFilt, it's still difficult to install). The highly anticipated Concept in the latest C++0x that could improve this problem has been cancelled. Where should C++ go from here? C programmers (including Uncle Linus) say that C++ is simply an evil language - inefficient, complex, violating the KISS principle, and unable to perform well at the lower levels like operating systems. Everyone seems to have a point. Is C++ really such a language that's neither here nor there?

I've also used C and C#, and even won some small awards in university competitions for these two languages, so I can at least say I have a rough understanding of them.

But the one I love most and have spent the most time on is still C++. C++ was the first language I learned, and I've endured many hardships along the way. As a federation in the language kingdom [EFC++Item1], C++ fascinates me with its flexibility and elasticity. It's like a master proficient in Tai Chi, **embracing all rivers**, yet **deeply humble**. It has exquisite techniques like SFINAE and tag dispatching (the complexity of these techniques is also a major reason for criticism).

It has the mature and sophisticated STL library, with flexible and ingenious implementations of various data structures and common algorithms with high extensibility. It has the progressive boost library, loki library, the heavyweight network communication development framework ACE, and the efficient Blitz++ scientific library, among others.

All the "high-level" features in C# can be implemented in C++ (without the word "basic" - you say it's impossible? Then go see what language C#'s managed mechanism is written in). Although you'll spend more time learning and debugging, I think the joy along the way can only be truly appreciated by doing it yourself.

Its working efficiency is on par with C (You say C++ is inefficient? Have you deeply used C++? Have you seen the memory allocation implementation in SGI's implementation?). C++ can also effortlessly use existing C code (so-called C-Style). The fact that generic sort in C++ STL completely outperforms qsort in C is also a topic C++ programmers love to discuss.

But which language isn't the product of countless experts and masters' **refinement through thousands of hammerings**? Arguing about which language is good or bad only shows your **inferiority** complex. When you talk about whether a language is good or bad, have you thought about whether you've **truly** studied it in depth? Do you **truly** understand the characteristics of this language?

Please remember this: **Good craftsmen never blame their tools. Languages have no good or bad distinctions, they only have their respective advantages in specific environments.**

For beginners, mastering a language is the key to opening the door to the world of computer fundamentals. The quality of the language doesn't matter; what matters is what you gain from learning it.

If you're **solely obsessed with syntax details**, confining all your thoughts to Kong Yiji's debate about the different ways to write the character "茴" in "茴香豆" (like those grade exams that test obscure language details), you will **lose more than you gain**.

In the advanced stage of learning, you can diverge your thinking by broadly studying other languages; it can even help you better understand the language you currently love.

For those who are obsessed with arguing about which language has more "money prospects", I suggest you change careers. (You say I'm being pretentious, that programmers need to eat too, reality is cruel, etc. I can only say, if even eating is a problem, you're not suitable to discuss the merits of languages at this level, you should continue learning).

by guanlan December 2009

---

*Original Chinese version: [http://www.cppblog.com/xguru/archive/2009/12/20/103596.html](http://www.cppblog.com/xguru/archive/2009/12/20/103596.html)*

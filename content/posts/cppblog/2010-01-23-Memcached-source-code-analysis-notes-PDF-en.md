---
title: "Memcached Source Code Analysis Notes PDF"
date: 2010-01-23 00:00:00+08:00
draft: false
categories: ['Memcached']
tags: ['Original']
author: "guanlan"
---

Memcached is a free, open source, high-performance, distributed memory object caching system, aimed at speeding up dynamic web applications by alleviating database load.  
  
As the saying goes, the palest ink is better than the best memory.  
[This document](http://www.cppblog.com/Files/guanlan/Memcached.pdf) is what I use to record some experiences during the process of reading Memcached source code, as well as analyzing some internal working mechanisms of memcached.  
I hope it can also bring convenience to everyone.  
  
PDF Table of Contents  
  
1\. Background .................................................................................................................................. 3  
2\. Memcached Installation ........................................................................................................... 4  
3\. Memcached Configuration ........................................................................................................... 5  
4\. Memcached Usage ........................................................................................................... 6  
4.1. Storage Commands ............................................................................................................ 7  
4.2. Retrieval Commands ............................................................................................................ 8  
4.3. Deletion Commands ............................................................................................................ 8  
4.4. Advanced Commands ............................................................................................................ 9  
4.5. Other Commands .......................................................................................................... 10  
5\. Memcached Internal Working Mechanism ............................................................................................. 11  
5.1. Memcached Basic Data Structures .......................................................................... 11  
5.2. Basic Design Concepts and Processing Flow .............................................................................. 12  
5.3. Internal Hash Mechanism ................................................................................................ 15  
5.3.1. Hash Function and Collision Resolution ............................................................................. 15  
5.3.2. HashTable Main Functions ................................................................................ 15  
5.4. Slab Memory Handling Mechanism ........................................................................................... 17  
5.4.1. Slab Main Functions ........................................................................................... 17  
5.4.2. LRU Algorithm Used in Slab Mechanism ............................................................. 19  
5.5. Various Functions for Controlling Items ......................................................................................... 20  
5.6. Daemon Process Mechanism .................................................................................................. 22  
5.7. Socket Handling Mechanism .............................................................................................. 23  
5.7.1. Unix Domain Protocol .............................................................................................. 23  
5.7.2. TCP/UDP Protocol ......................................................................................... 24  
5.8. Multi-threading Handling Mechanism .............................................................................................. 25  
5.9. Event Handling Mechanism .................................................................................................. 25  
6\. Unfinished Aspects ..................................................................................................................... 27  
7\. References ......................................................................................................................... 28  
  
My abilities are limited, everyone is welcome to criticize!  
[Download PDF](http://www.cppblog.com/Files/guanlan/Memcached.pdf)  
  

# References

[1].Masahiro Nagano[JP] & charlee(translator).[Comprehensive Analysis of memcached](http://tech.idv2.com/2008/08/17/memcached-pdf/).2008-7-2

[2].W.Richard Stevens & Yang Jizhang(translator).UNIX Network Programming (Third Edition).2004

[3]. W.Richard Stevens.Advanced Programming in the UNIX Environment (Second Edition).2005

[4]. dsallings.[Memcached FAQ](http://code.google.com/p/memcached/wiki/FAQ).2009-9

[5]. bachmozart .[Memcached Source Code Analysis (Thread Model)](http://www.javaeye.com/topic/344172). 

[6]. Love Writing Development Blog.[Enabling Memcached Support for Wordpress on Linux](http://dev.ixiezi.com/230.html).

  


---

*Original Chinese version: [http://www.cppblog.com/xguru/archive/2010/01/23/106265.html](http://www.cppblog.com/xguru/archive/2010/01/23/106265.html)*

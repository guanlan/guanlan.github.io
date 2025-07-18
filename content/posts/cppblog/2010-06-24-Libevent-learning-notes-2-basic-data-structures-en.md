---
title: "Libevent Learning Notes (2) - Basic Data Structures"
date: 2010-06-24 00:00:00+08:00
draft: false
categories: ['Libevent']
tags: ['original']
author: "guanlan"
---

## 2.1 event_base Core Event Base Data Structure

##   
  

![](/img/libevent1.jpg)

  
As can be seen, event_base is the core part of the entire libevent, which consists of three structures: a time heap (corresponding to EVLIST_TIMEOUT), a registered queue (corresponding to EVLIST_INSERTE), and an active event queue (corresponding to EVLIST_ACTIVE).

The time heap uses min-Heap (minimum binary heap), while both the registered queue and active event queue use doubly linked lists.

The registered queue corresponds to eventqueue in the event base, and the active event queue corresponds to the activequeues[ev->ev_pri] structure array in the event base. Here, ev_pri represents the priority of the event, with smaller values indicating higher priority levels.

You can set its priority by calling the event_priority_set() function. By default, it is inserted with medium priority (nactivequeues/2, i.e., the total number of active queues divided by 2).

  

### 2.2 Timeout Queue (min-Heap Minimum Binary Heap)

A classic data structure min-Heap is used here to handle the timeout mechanism. The source code is located in Min_heap.h

![](/img/libevent2.jpg)

libevent has been using min-Heap instead of RB-Tree since version 1.4.

Principles followed by min-Heap (minimum binary heap):

1. It is a complete binary tree

2. Its smallest element is at the top, and each element is larger than (or equal to) its parent node.

The time complexity for inserting elements is O(log n), and the complexity for finding the minimum value is only O(1).  
  

The variable names in libevent's min-Heap implementation are a bit awkward.  

1![](/img/None.gif)typedef struct min_heap  
2![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
3![](/img/InBlock.gif) struct event** p;  
4![](/img/InBlock.gif) unsigned n, a;  
5![](/img/ExpandedBlockEnd.gif)} min_heap_t;  
6![](/img/None.gif)

p can be understood as an array storing event pointers, n represents the capacity, and a represents the current count.

In heap operation functions, generally e represents an event, and s represents the min-Heap being manipulated.

The author of this min-heap should be from the OOP camp, as it includes min_heap_ctor() corresponding to a constructor, and min_heap_dtor() corresponding to a destructor.

  

### 2.3 Event Queue (Doubly Linked List)

The data structures used for active event queues and registered queues in libevent are both implemented using macros, originally defined in FreeBSD's <[sys/queue.h](http://cvsweb.netbsd.org/bsdweb.cgi/src/sys/sys/queue.h?rev=1.30)>. For cross-platform support on Linux, libevent has concentrated some of the code in event_internal.h.

![](/img/libevent3.jpg)  

1![](/img/None.gif)#define TAILQ_ENTRY(type) \  
2![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)struct ![](/img/dot.gif){ \  
3![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) struct type *tqe_next; /**//* next element */ \  
4![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) struct type **tqe_prev; /**//* address of previous element */ \  
5![](/img/ExpandedBlockEnd.gif)}  
6![](/img/None.gif)

Macro operations used by libevent  

**Macro Name** |  **Operation**  
---|---  
      
    
    TAILQ_INIT

|  Initialize queue  
TAILQ_FOREACH |  Traverse the queue  
TAILQ_INSERT_BEFORE |  Insert element before specified element  
TAILQ_INSERT_TAIL |  Insert element at the tail of queue  
TAILQ_EMPTY |  Check if queue is empty  
TAILQ_REMOVE |  Remove element from queue


---

*Original link: [http://www.cppblog.com/xguru/archive/2010/06/24/118598.html](http://www.cppblog.com/xguru/archive/2010/06/24/118598.html)*

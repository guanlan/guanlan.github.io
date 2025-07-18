---
title: "Libevent Analysis Notes (3) - Determining I/O Multiplexing Mechanism"
date: 2010-06-25 00:00:00+08:00
draft: false
categories: ['Libevent']
tags: ['original']
author: "guanlan"
---

Libevent's original intention was to design a cross-platform lightweight I/O framework. Due to historical issues, the I/O multiplexing mechanisms across different platforms are difficult to unify. Therefore, the methods for handling cross-platform compatibility deserve special attention.

eventop is defined in the source code as follows:

```cpp
static const struct eventop *eventops[]={

#ifdef HAVE_EVENT_PORTS

         &evportops,

#endif 

…

}
```



As can be seen, libevent uses macros to find available multiplexing mechanisms at compile time.

The order here is also significant. According to the official documentation, the multiplexing mechanisms supported by libevent include [/dev/poll](http://access1.sun.com/techarticles/devpoll.html), [kqueue(2)](http://www.freebsd.org/cgi/man.cgi?query=kqueue&apropos=0&sektion=0&format=html), [event ports](http://developers.sun.com/solaris/articles/event_completion.html), select(2), poll(2) and [epoll(4)](http://www.xmailserver.org/linux-patches/epoll.txt). 

Through benchmark testing of various mechanisms, libevent developers have chosen the priority order of multiplexing mechanisms based on performance from high to low, as shown in the figure:

![](/img/libevent4.jpg)****

This also reveals the lack of uniformity in mechanisms across different platforms. Standard poll and select can hardly meet the needs of large-scale architectures. For specifics, refer to Dan Kegel's "[The C10K problem](http://www.kegel.com/c10k.html)" document.

Regarding the adoption of mechanisms, libevent uses function pointers.

__

```cpp
struct eventop {
    const char *name; /*机制名称*/
    void *(*init)(struct event_base *); /*初始化事件*/
    int (*add)(void *, struct event *);    /*添加事件*/
    int (*del)(void *, struct event *);    /* 删除事件*/
    int (*dispatch)(struct event_base *, void *, struct timeval *) /* 调度事件 */
    void (*dealloc)(struct event_base *, void *);/* 释放资源*/
    int need_reinit;
};

```



Each eventop corresponds to an I/O multiplexing mechanism, where each function pointer points to methods for operating events using that mechanism.

For example, in the eventop structure corresponding to epoll:  
1. The void *(*init)(...) function pointer corresponds to static void * epoll_init(...)  
2. In epoll_init(), it first checks the environment variables and returns NULL immediately if epoll mechanism is not found.  
3. It uses epoll_create(32000) to specify an upper limit of 32000 connections, then allocates resources needed for each member of epollop.  
4. Finally, it calls libevent's own signal initialization function.

The process of selecting and initializing a mechanism is very simple:

```cpp
  for (i = 0; eventops[i] && !base->evbase; i++) {

       base->evsel = eventops[i];

       base->evbase = base->evsel->init(base);

    }

```

![](/img/libevent5.jpg)  

It traverses the eventops array storing mechanisms, trying to initialize them in order. Once a mechanism is successfully initialized, it immediately exits the loop. Of course, you don't need to worry about all the trivial details of detecting available mechanisms in the system environment, choosing which mechanism is more suitable, or how to use specific multiplexing mechanisms. When using it, you just need to call the event_init() function. Libevent's clever encapsulation of various multiplexing mechanisms saves developers from the trouble of dealing with mechanism selection when handling cross-platform issues in large-scale architectures. 






---

*Original link: [http://www.cppblog.com/xguru/archive/2010/06/25/118722.html](http://www.cppblog.com/xguru/archive/2010/06/25/118722.html)*

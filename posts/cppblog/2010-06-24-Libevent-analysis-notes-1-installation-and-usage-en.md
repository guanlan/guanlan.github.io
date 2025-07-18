---
title: "Libevent Analysis Notes (1) - Installation and Usage"
date: 2010-06-24 00:00:00+08:00
draft: false
categories: ['Libevent']
tags: ['original']
author: "guanlan"
---

Introduction to Libevent

![](/img/None.gif)The libevent API provides a mechanism to execute a callback function when a specific event occurs on a file descriptor or after a timeout has been reached. Furthermore, libevent also support callbacks due to signals or regular timeouts. 
    
    
    The libevent API provides such a mechanism:  
    Execute a specified callback function when a specific event occurs in a specified file descriptor, or when a timeout is reached.  
    Additionally, libevent callback functionality also supports triggering by signals or regular timeouts.  
    Note that its license is a BSD-style license, which can be used in commercial products without having to open source.  
    
    
    ##  
    
    
    
    ## 1. Compilation and Installation
    
    
      
     
    
    
    In Ubuntu, you can install directly using apt:
    
    
    
    
     
    
    
    
    
    ![](/img/None.gif) ~$  sudo apt-get install libevent
    
    
    
    
    Or use:
    
    
    
    
    ![](/img/None.gif)~$  wget http://monkey.org/~provos/libevent-1.4.13-stable.tar.gz  
    ![](/img/None.gif)~$  tar –xzvf  libevent-1.4.13-stable.tar.gz  
    ![](/img/None.gif)~$  cd libevent-1.4.13-stable  
    ![](/img/None.gif)~$  ./configure  
    ![](/img/None.gif)~$  make  
    ![](/img/None.gif)~$  sudo make install  
      
    ![](/img/None.gif)
    
    
    

**2. Library Usage  
**

You can understand the basic usage of libevent from these simple examples. When compiling, you need to add the "-levent" parameter.

### 2.1. I/O Events (corresponding to EV_READ, EV_WRITE)

Below is a simplified server program snippet that uses libevent to return system time.  

1![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)void get_time(int fd,short event,struct event *arg) /**//*Get system time and write it back*/  
2![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
3![](/img/InBlock.gif)……  
4![](/img/InBlock.gif) localtime_r(&now,&t);  
5![](/img/InBlock.gif) asctime_r(&t,buf);  
6![](/img/InBlock.gif) write( fd,buf,strlen(buf) );  
7![](/img/InBlock.gif)……  
8![](/img/ExpandedBlockEnd.gif)}  
9![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)void con_accept(int fd,short event,void *arg) /**//*Callback function provided to the event, accepts a connection*/  
10![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
11![](/img/InBlock.gif) struct sockaddr_in s_in;  
12![](/img/InBlock.gif) socklen_t len = sizeof(s_in);  
13![](/img/InBlock.gif) int ns = accept(fd,(struct sockaddr *) &s_in,&len);  
14![](/img/InBlock.gif) struct event *ev = malloc(sizeof(struct event));  
15![](/img/InBlock.gif) event_set(ev,ns,EV_WRITE,(void *)get_time,ev);  
16![](/img/InBlock.gif) event_add(ev,NULL);  
17![](/img/ExpandedBlockEnd.gif)}  
18![](/img/None.gif)   
19![](/img/None.gif)int main()  
20![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
21![](/img/InBlock.gif) int sockfd = socket(PF_INET,SOCK_STREAM,0);  
22![](/img/InBlock.gif) struct sockaddr_in s_in;  
23![](/img/InBlock.gif)……  
24![](/img/InBlock.gif) bind(sockfd,(struct sockaddr*) &s_in,sizeof(s_in));  
25![](/img/InBlock.gif) listen(sockfd,5);  
26![](/img/InBlock.gif) event_init(); //libevent initialization  
27![](/img/InBlock.gif)  
28![](/img/InBlock.gif) struct event ev;  
29![](/img/InBlock.gif) event_set(&ev,sockfd,EV_READ|EV_PERSIST,con_accept,&ev);  
30![](/img/InBlock.gif)//Set event properties to readable, persistent, callback function is con_accept()  
31![](/img/InBlock.gif) event_add(&ev,NULL);//Add event, no timeout set  
32![](/img/InBlock.gif) event_dispatch();//Enter libevent main loop  
33![](/img/InBlock.gif) return 0;  
34![](/img/ExpandedBlockEnd.gif)}  
35![](/img/None.gif)

  

### 2.2. Signal Handling Events (corresponding to EV_SIGNAL)  

1![](/img/None.gif) static void signal_cb(int fd, short event, void *arg)  
2![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
3![](/img/InBlock.gif) struct event *signal = arg;  
4![](/img/InBlock.gif) printf("%s: got signal %d\n", __func__, EVENT_SIGNAL(signal));  
5![](/img/InBlock.gif) if (called >= 2)  
6![](/img/InBlock.gif) event_del(signal); //If called more than twice, delete this signal  
7![](/img/InBlock.gif) called++;  
8![](/img/ExpandedBlockEnd.gif)}  
9![](/img/None.gif)  
10![](/img/None.gif)int main (int argc, char **argv)  
11![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
12![](/img/InBlock.gif) struct event signal_int;  
13![](/img/InBlock.gif) event_init();//libevent initialization  
14![](/img/InBlock.gif) event_set(&signal_int, SIGINT, EV_SIGNAL|EV_PERSIST, signal_cb, &signal_int);   
15![](/img/InBlock.gif)//Set event properties to signal-triggered, persistent, callback function is signal_cb()  
16![](/img/InBlock.gif) event_add(&signal_int, NULL); //Add event  
17![](/img/InBlock.gif) event_dispatch();//Enter libevent main loop  
18![](/img/InBlock.gif) return 0;  
19![](/img/ExpandedBlockEnd.gif)}  
20![](/img/None.gif)

  

### 2.3. Regular Timeout Handling (corresponding to EV_TIMEOUT)  

1![](/img/None.gif)static void timeout_cb(int fd, short event, void *arg)  
2![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
3![](/img/InBlock.gif) struct timeval tv;  
4![](/img/InBlock.gif) struct event *timeout = arg;  
5![](/img/InBlock.gif) int newtime = time(NULL);  
6![](/img/InBlock.gif) printf("%s: called at %d: %d\n", __func__, newtime,  
7![](/img/InBlock.gif) newtime - lasttime);  
8![](/img/InBlock.gif) lasttime = newtime;  
9![](/img/InBlock.gif) evutil_timerclear(&tv);  
10![](/img/InBlock.gif) tv.tv_sec = 2;  
11![](/img/InBlock.gif) event_add(timeout, &tv);  
12![](/img/ExpandedBlockEnd.gif)}  
13![](/img/None.gif)  
14![](/img/None.gif)int main (int argc, char **argv)  
15![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
16![](/img/InBlock.gif) struct event timeout;  
17![](/img/InBlock.gif) struct timeval tv;  
18![](/img/InBlock.gif) event_init();//libevent initialization  
19![](/img/InBlock.gif) evtimer_set(&timeout, timeout_cb, &timeout);  
20![](/img/InBlock.gif)//Actually this function corresponds to event_set(timeout, -1, 0, timeout_cb,&timeout)  
21![](/img/InBlock.gif)evutil_timerclear(&tv); //If there's a time clearing function, it directly corresponds to timerclear(), otherwise set tv_sec and tv_usec to 0  
22![](/img/InBlock.gif)  
23![](/img/InBlock.gif) tv.tv_sec = 2;  
24![](/img/InBlock.gif) event_add(&timeout, &tv);  
25![](/img/InBlock.gif) lasttime = time(NULL);  
26![](/img/InBlock.gif) event_dispatch();  
27![](/img/InBlock.gif) return 0;  
28![](/img/ExpandedBlockEnd.gif)}  
29![](/img/None.gif)


---

*Original link: [http://www.cppblog.com/xguru/archive/2010/06/24/118597.html](http://www.cppblog.com/xguru/archive/2010/06/24/118597.html)*

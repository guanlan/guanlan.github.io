---
title: "Practical Tips on Writing an Effective Web Crawler"
date: 2021-01-15
author: "guanlan"
tags: ["Networking"]
---
A web crawler is a hard-working bot to gather information or index the pages on the Internet. It starts at some seeds URLs and finds every hyperlink on each page, and then crawler will visit those hyperlinks recursively.

### 1\. Choose an Ideal Programming Language

Based on the ranking of popular languages on developing web crawlers (based on result numbers of relative repositories host on Github on February, 2013). Python or Ruby probably is a wise choice, the mainly speed limit of web crawler is network latency not CPU, so choose Python or Ruby as a language to develop a web crawler will make life easier. Python provide some standard libraries, they are very useful, such like urllib, httplib and regex, those libraries can handle lots of work. Python also has plenty of valuable third-party libraries worth a try: **[scrapy](http://scrapy.org/)**, a web scraping framework. **[urllib3](http://urllib3.readthedocs.org/en/latest/)**, a Python HTTP library with thread-safe connection pooling, file post support. **[greenlet](http://greenlet.readthedocs.org/)**, a Lightweight concurrent programming framework. _**[twisted](http://twistedmatrix.com/)**_, an __event-driven networking engine.__  

### 2\. Reading Some Simple Open-source Projects

You need to figure out how exactly does a crawler works. Here is a very simple crawler written in Python, in 10 lines of code. 

```python
import re, urllib
crawled_urls = set()

def crawl(url): 
  for new_url in re.findall('''href=["'\](.[^"'\]+)["'\]''', urllib.urlopen(url).read()): 
    if new_url not in crawled_urls:
      print new_url crawled_urls.add(new\_url) 
      if __name__ == "__main__":
        url = 'http://www.yahoo.com/'
        crawl(url) 
```



\[python\] i\[/python\] Crawler usually needs to keep track of which URLs need to be crawled, and which URLs has already crawled (to avoid the infinite loop). Other simple projects: [**Python Crawler**](http://code.google.com/p/python-crawler/), a very simple crawler using Berkeley DB to store results. [**pholcidae**](https://github.com/bbrodriges/pholcidae), a tiny Python module allows you to write your own crawl spider fast and easy.

### 3.Choosing the Right Data Structure

Choosing a proper data structure will make your crawler efficiently. Queue or Stack is a good choice to store the URLs need be crawled, Hash table or R-B tree seems proper for tracking the crawled URLs, it provide a fast speed to search. Search Time Complexity: Hash table O(1), R-B Tree O(log n) But what if your crawler needs to deal with tons of URLs your memory is not enough? Try to store the checksum of URL string, if it still not enough, you may need to use the Cache algorithms (such like LRU) to dump some URLs into the disk.

### 4\. Multithreading and Asynchronous

If you crawling sites from different servers, using multithreading or asynchronous mechanism will save you lots of time. Remember keep your crawler thread-safe, you need a thread-safe queue to share the results and a thread controller to handle threads. Asynchronous is a event-based mechanism will make your crawler enter a while loop, when an events triggers (some resources become available), your crawler will wake up to do deal with this event (usually by execute callback function), Asynchronous can improve throughput, latency of your crawler. _Related Resources:_ [_How to write a multi-threaded webcrawler_](http://www.andreas-hess.info/programming/webcrawler/index.html#AnotherWebcrawler), Andreas Hess

### 5\. HTTP Persistent Connections

Every time sends an HTTP request you need to open a TCP socket connection, when you finish request, this socket will be closed. When you crawl lots of pages on a same server, you will open and close the socket again and again. The overhead cost is quite a big problem. \[code\]Connection: Keep-Alive\[/code\] Use this header in your HTTP request to tell the server your client support keep-alive. Your code also should be modified accordingly.

### 6\. Efficient Regular Expressions

You should really figure out how the regex works, a good regex really makes a difference in performance. When your web crawlers parsing the information of the HTTP response, the same regex will execute frequently. Compile a regex need little more time in the beginning, but it will run faster when you use it. Notice if you are using Python (or .NET), it will automatically compile and cache the regexs, but it may still be worthwhile to manually do it, you can give it a proper name after compiling a regex, it will make your code more readable. If you want parser even faster, you probably need to write a parser by yourself. Related Resources: [Mastering Regular Expressions](http://www.amazon.com/Mastering-Regular-Expressions-Jeffrey-Friedl/dp/0596528124), Third Edition by Jeffrey Friedl. [Performance of Greedy vs. Lazy Regex Quantifiers](http://blog.stevenlevithan.com/archives/greedy-lazy-performance "Permanent Link to Performance of Greedy vs. Lazy Regex Quantifiers"), _Steven Levithan_ [Optimizing regular expressions in Java](http://www.javaworld.com/javaworld/jw-09-2007/jw-09-optimizingregex.html), Cristian Mocanu

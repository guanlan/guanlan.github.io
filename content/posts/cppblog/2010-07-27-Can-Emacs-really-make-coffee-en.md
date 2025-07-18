---
title: "[Fun] Can Emacs Really Make Coffee?"
date: 2010-07-27 00:00:00+08:00
draft: false
categories: []
tags: ['fun']
author: "guanlan"
---

  
Can Emacs Really Make Coffee? by [guanlan](http://www.cppblog.com/xguru)   

  
![](/img/467px-Vacpot3.jpg) |   
|   
|   
|   
|   
|   
|   
|   
|  There's a saying that goes: "Emacs can do anything, even make coffee!"  
  
What does making coffee mean? This aroused my curiosity for investigation.  
  
After searching online, I came up with several preliminary conclusions:  
  
1. This is just a fun saying, used to describe Emacs's all-encompassing functionality.   
  
2. Java's logo is a cup of coffee, used to figuratively represent writing code  
![](/img/java.png)  
  
3. Emacs does indeed [have a coffee-making function](http://people.ku.edu/%7Esyliu/shredderyin/emacs_power.html), with scripts that can control automatic coffee machines.   
---|---|---|---|---|---|---|---|---|---  
  

  
The first explanation seems more logical; the second seems a bit abrupt, after all, Emacs was written by [Richard Stallman](http://en.wikipedia.org/wiki/Richard_Stallman "Richard Stallman") (GNU founder), while Java was completed by [Bill Joy](http://en.wikipedia.org/wiki/Bill_Joy) (vi author) and others. These two camps almost escalated to religious conflict, so this explanation seems a bit unsatisfactory; the third would be very interesting if true.  
  
  
So I began investigating. First, I traced back to the [source](http://emarsden.chez.com/downloads/coffee.el) of this script code. I found the address was no longer valid, but finally found a [copy](http://archive.debian.net/zh-cn/woody/all/emacs-goodies-el/download) in a Debian [package](http://archive.debian.net/zh-cn/woody/editors/emacs-goodies-el). This is a package of commonly used Emacs scripts.  
  
The code is as follows:  

1 ;;; coffee.el --- Submit a BREW request to an RFC2324-compliant coffee device  
2 ;;;  
3 ;;; Author: Eric Marsden <emarsden@laas.fr>  
4 ;;; Version: 0.2  
5 ;;; Copyright: (C) 1999 Eric Marsden  
6 ;;; Keywords: coffee, brew, kitchen-sink, can't  
7 ;;  
8 ;; This program is free software; you can redistribute it and/or  
9 ;; modify it under the terms of the GNU General Public License as  
10 ;; published by the Free Software Foundation; either version 2 of  
11 ;; the License, or (at your option) any later version.  
12 ;;   
13 ;; This program is distributed in the hope that it will be useful,  
14 ;; but WITHOUT ANY WARRANTY; without even the implied warranty of  
15 ;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the  
16 ;; GNU General Public License for more details.  
17 ;;   
18 ;; You should have received a copy of the GNU General Public  
19 ;; License along with this program; if not, write to the Free  
20 ;; Software Foundation, Inc., 59 Temple Place - Suite 330, Boston,  
21 ;; MA 02111-1307, USA.  
22 ;;  
23 ;; Please send suggestions and bug reports to <emarsden@laas.fr>.  
24 ;; The latest version of this package should be available at  
25 ;;  
26 ;; <URL:http://purl.org/net/emarsden/home/downloads/>  
27   
28 ;;; Commentary:  
29 ;;  
30 ;; This module provides an Emacs interface to RFC2324-compliant coffee  
31 ;; devices (Hyper Text Coffee Pot Control Protocol, or HTCPCP). It  
32 ;; prompts the user for the different additives, then issues a BREW  
33 ;; request to the coffee device.  
34 ;;  
35 ;; coffee.el requires a special BREW-capable version of Emacs/W3 to be  
36 ;; installed.  
37 ;;  
38 ;; Reference: <URL:ftp://ftp.isi.edu/in-notes/rfc2324.txt>  
39 ;;  
40 ;;  
41 ;; Thanks to Giacomo Boffi <giacomo.boffi@polimi.it> for some typos  
42 ;; and the addition of the "Brown-Coffee" sweetener type.  
43   
44 ;;; Code:  
45   
46 (require 'cl)  
47   
48 (defvar coffee-host "coffee"  
49 "*The host which provides the coffee service.")  
50   
51 (defvar coffee-pot-designator 1  
52 "*On machines with multiple pots, the number of the pot to brew in")  
53   
54 (defvar coffee-brew-hook nil  
55 "*Hook executed before issuing a BREW request")  
56   
57 (defconst coffee-milk-types  
58 '("Cream" "Half-and-Half" "Whole-Milk" "Part-Skim" "Skim" "Non-Dairy"))  
59   
60 (defconst coffee-syrup-types '("Vanilla" "Almond" "Raspberry" "Chocolate"))  
61   
62 (defconst coffee-sweetener-types '("White-Sugar" "Brown-Sugar" "Artificial-Sweetener"))  
63   
64 (defconst coffee-alcohol-types '("Whiskey" "Rum" "Kahula" "Aquavit"))  
65   
66 (defconst coffee-addition-types  
67 `(("Milk" . ,coffee-milk-types)  
68 ("Syrup" . ,coffee-syrup-types)  
69 ("Sweetener" . ,coffee-sweetener-types)  
70 ("Alcohol" . ,coffee-alcohol-types)))  
71   
72 ;;;###autoload  
73 (defun coffee ()  
74 "Submit a BREW request to an RFC2324-compliant coffee device"  
75 (interactive)  
76 (require 'url)  
77 (let* ((additions-list  
78 (append coffee-milk-types  
79 coffee-syrup-types  
80 coffee-sweetener-types  
81 coffee-alcohol-types))  
82 (additions-string  
83 (mapconcat #'identity additions-list ","))  
84 (url (coffee-url))  
85 (url-request-method "BREW")  
86 (url-request-extra-headers  
87 `(("Content-type" . "message-coffeepot")  
88 ("Accept-Additions" . ,additions-string)))   
89 (url-request-data "START"))  
90 (run-hooks 'coffee-brew-hook)  
91 (url-retrieve url)))  
92   
93 (defun coffee-additions ()  
94 (let* ((type-name  
95 (completing-read "Coffee addition: " coffee-addition-types nil t))  
96 (type (cdr (assoc type-name coffee-addition-types)))  
97 (ingredients (mapcar #'(lambda (a) (cons a a)) type))  
98 (ingredient  
99 (completing-read "Addition type: " ingredients nil t)))  
100 ingredient))  
101   
102 (defun coffee-url ()  
103 (require 'w3-forms)  
104 (concat "coffee://" coffee-host "/"  
105 (int-to-string coffee-pot-designator)  
106 "?" (w3-form-encode-xwfu (coffee-additions))))  
107   
108   
109 (provide 'coffee)  
110   
111 ;; coffee.el ends here

  
This script looks quite serious, mentioning "Submit a BREW request to an RFC2324-compliant coffee device"  
  
It can submit BREW requests to coffee devices compatible with the [RFC2324](http://www.ietf.org/rfc/rfc2324.txt) protocol, i.e., compatible with the Hyper Text Coffee Pot Control Protocol (HTCPCP/1.0). Hyper Text Coffee Pot Protocol - just the name is amusing enough, but this protocol is written very formally, without showing any flaws. A careful friend shrek.wang reminded me to note the date:  
  

Network Working Group L. Masinter  
Request for Comments: 2324 1 April 1998  

  
April 1, 1998 - April Fool's Day! This raises questions.  
By checking wiki, I discovered that the [Internet Engineering Task Force](http://zh.wikipedia.org/zh-cn/%E4%BA%92%E8%81%94%E7%BD%91%E5%B7%A5%E7%A8%8B%E5%B7%A5%E4%BD%9C%E5%B0%8F%E7%BB%84 "Internet Engineering Task Force") are also talented pranksters.  
  
Here are some fun examples:  

  *     * In 2001, [RFC 1149](http://tools.ietf.org/html/rfc1149) was implemented by members of the Norwegian Linux User Group. They transmitted 9 packets to a location about 5 kilometers away, each packet carried by a different [pigeon](http://zh.wikipedia.org/zh-cn/%E9%B8%BD%E5%AD%90 "pigeon"), with an ICMP echo request packet ([ping](http://zh.wikipedia.org/zh-cn/Ping "Ping")). They received 4 responses, with a packet loss rate of 55% and response times of 3000 to 6000 seconds. [[1]](http://www.blug.linux.no/rfc1149/)
    * [RFC 1607](http://tools.ietf.org/html/rfc1607) — **A View from the [21st Century](http://zh.wikipedia.org/zh-cn/21%E4%B8%96%E7%B4%80 "21st Century")** [Vint Cerf](http://zh.wikipedia.org/w/index.php?title=Vint_Cerf&action=edit&redlink=1 "Vint Cerf (not yet written)") [1994](http://zh.wikipedia.org/zh-cn/1994 "1994"). 
    * [RFC 3091](http://tools.ietf.org/html/rfc3091) — **[Pi](http://zh.wikipedia.org/zh-cn/%E5%9C%86%E5%91%A8%E7%8E%87 "Pi") Digit Generation Protocol** . H. Kennedy [2001](http://zh.wikipedia.org/zh-cn/2001%E5%B9%B4 "2001")

More can be found on [this wiki](http://zh.wikipedia.org/zh-cn/%E6%81%B6%E6%90%9ERFC).  
  
  
We can boldly conclude that this protocol is just a good-natured joke by the **IETF**, and coffee.el's author Eric Marsden is also a humorous programmer who made a script compatible with RFC2324. He never intended to actually control a coffee machine, so this whole thing stems from programmers' dry humor.  
![](/img/coffee.jpg)   
However, remote control of coffee machines is still possible. Here's an [open source coffee maker](http://hardware.slashdot.org/article.pl?sid=08/12/10/1838233); and here's a [network-controllable coffee maker](http://www.engadget.com/2007/09/13/the-internet-enabled-coffee-maker/) (supposedly RFC2324 compatible).  
I bet the IETF never dreamed that their joke would actually be made into real products. The geeks abroad really have too much time on their hands. It shows that geeks are quite humorous indeed.  
Friends, do you have the answer in your heart? Do you want such a coffee machine?  
  
  
  
  
  
  
  
PS. I have to complain about CPPBLOG's editor here - it's really terrible. When I clicked save while writing halfway through the article, it actually published it!  
  
![Creative commons license](/img/88x31.png)  

by [guanlan](http://www.cppblog.com/xguru) is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 2.5 China Mainland License](http://creativecommons.org/licenses/by-nc-sa/2.5/cn/).   

  



---

*Original link: [http://www.cppblog.com/xguru/archive/2010/07/27/121416.html](http://www.cppblog.com/xguru/archive/2010/07/27/121416.html)*

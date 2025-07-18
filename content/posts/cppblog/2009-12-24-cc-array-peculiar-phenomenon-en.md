---
title: "A 'Strange Phenomenon' in C/C++ Arrays"
date: 2009-12-24 00:00:00+08:00
draft: false
categories: ['C++']
tags: ['Original']
author: "guanlan"
---

Everyone is familiar with using arrays, right?  
Take a look at this program, it's quite simple.  

```cpp
#include<iostream>
int main()
{
    int a[] = {1,2,3,4,5};
    for(int i = 0 ; i < 5; i++)
        std::cout << i[a] << " ";
    return 0;
}

```




Now look carefully at line 6.  
What did you notice?  
Try compiling it to see if it passes?   


Let's simplify this program even more  

```cpp
int a[5] = {1,2,3,4,5};
int b = 1[a];
```



Now let's look at the generated assembly code  

```assembly
4:       int a[5] = {1,2,3,4,5};
00401568   mov         dword ptr [ebp-14h],1
0040156F   mov         dword ptr [ebp-10h],2
00401576   mov         dword ptr [ebp-0Ch],3
0040157D   mov         dword ptr [ebp-8],4
00401584   mov         dword ptr [ebp-4],5
5:        int b = 1[a];
0040158B   mov         eax,dword ptr [ebp-10h]
0040158E   mov         dword ptr [ebp-18h],eax
```



You're not seeing things wrong. At this moment, this array is possessed by Chuck Norris - the addresses pointed to by a[1] and 1[a] are the same, both are [ebp-10h].  

Why?  

Let's recall the relationship between arrays and pointers. How do we represent arrays with pointers?  
*a is a reference to the value at index 0 in array a, i.e., a[0],  
So what about *(a+i)?  
It should represent a reference to the value at index i in array a, i.e., a[i],  
So this phenomenon shouldn't be surprising:  
Because `*(a+i) == *(i+a)`  
Therefore `a[i] == i[a]`  

Did you feel an [aha! Insight](http://www.verycd.com/topics/2774740/) moment?  

Extended reading: ["C Traps and Pitfalls"](http://www.verycd.com/topics/2774317/) p33~p38  

  

  



---

*Original Chinese version: [http://www.cppblog.com/xguru/archive/2009/12/24/103864.html](http://www.cppblog.com/xguru/archive/2009/12/24/103864.html)*

---
title: "Python Basic Objects Learning Notes"
date: 2011-07-21 00:00:00+08:00
draft: false
categories: ['Python']
tags: ['original']
author: "guanlan"
---

Recently revisiting the book "Python Source Code Analysis", I've recorded the key points about Python basic objects as follows:
    
    
    **Python Integer Objects**  
     1. Python integers use C language's long type for storage  
    2. Python int addition checks if the result overflows, and automatically converts to pyLongObject if it does  
    3. Documentation in Python is seamlessly integrated into the language implementation  
    

1 a = 11  
2 print a.__doc__
    
    
      
    4. Small integer objects are completely cached in memory, other integer objects take turns using a block of memory space  
    5. Small integer objects are created in _PyInt_Init called during Python initialization, and exist until the Python virtual machine exits

  

    
    
    **Python String Objects**  
     1. After pyStringObject is created, the internally maintained string cannot be changed   
    2. Is the intern mechanism only used when character array length is 0 or 1? The code provided in the book is too simplified and doesn't explain clearly, but looking at the demonstration results later, it seems all strings implement the intern mechanism  
    3. String concatenation operations severely impact Python program execution efficiency. Using join only allocates memory once, greatly improving efficiency. Usage example:  
    

"".join(['s1','s2','s3'])
    
    
      
    
    
    
    **Python Dict Objects**  
     1. Python's dict uses hashtable instead of R-B Tree.  
    2. Uses open addressing to resolve conflicts.  
    3. To ensure continuity of the conflict detection chain, uses pseudo-deletion technique - deleted active objects are set to dummy state  
    4. To reduce conflicts, when load factor exceeds 2/3, table size is changed, increasing by 4x each time. If the number of active elements in the table exceeds 50000 (giant table),  
       growth rate is slowed down to 2x each time. It can be seen that Python dict has high lookup efficiency, while being very economical with memory usage, also considering reduced growth factor for giant tables.  
      
    
    
    
    **Python List Objects**  
     1. PyListObject is similar to Vector in STL.  
    2. Python is very frugal with memory usage - if the new size after list change is less than 1/2 of allocated memory, it shrinks the memory.  
    3. Inserting elements in the middle of PyList requires moving subsequent elements one by one, similar to C arrays, so insertions and deletions of middle elements should be avoided.  
    4. Comparison of STL and PyListObject automatic expansion algorithms: personally I think list would be more appropriately named array, hehe  
    

//sgi STL:  
len = (old_size != 0 )?2*oldsize:1  
//(expand by 2x if not enough, if initially empty set to 1)  
//Python:  
new_allocated=(newsize>>3)+(newsize<9?3:6)  
//(???)
    
    
    5. Regarding the choice of growth factor, there's discussion here:  
    [http://en.w3support.net/index.php?db=so&id=1100311](http://en.w3support.net/index.php?db=so&id=1100311)  
      
    p70 typo in the book: "allcated/2" should be "allocated/2"  
    

  



---

*Original link: [http://www.cppblog.com/xguru/archive/2011/07/21/Python_object.html](http://www.cppblog.com/xguru/archive/2011/07/21/Python_object.html)*

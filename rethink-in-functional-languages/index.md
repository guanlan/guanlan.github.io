# Rethink in Functional Languages


After about 3 months to learn and using Racket (a programming language in Lisp/Scheme family),  I learning lots of concepts of programming. The most important thing in FL(functional languages) is: **"_All data are immutable. All functions are pure._"**  

 Immutable Data
---------------

Immutable data cannot be modified after being created. It has many advantages:

1.  **Inherently Thread safety** Parallel programming is the nightmare of some programers, because different threads simultaneously access the same object can cause unexpected problem, such like a race conditions. The most famous and classical example is [Bank Account Problem](http://en.wikipedia.org/wiki/Race_condition#Example). Today we get more and more cores in our computers, so the [multi-core crisis](http://www.infoq.com/news/2008/06/scala-vs-erlang) we need to face, some experts believe in the future, we using Scala or Erlang to deal with this crisis.Interesting thing is many "next generation" language is either the functional or support functional paradigm.
2.  **Eliminate side-effects** There are so many reasons. Most important thing is global variables are difficult to understand. For example, if we want understand one functions in the non-trival project,  and we find a variable define in other place, so we will jump to the definition of this variable and other places where modify it, it will cost us more time to figure out what the exactly meaning of this function. So there is the same reason why the code is much easier to understand if we use immutable objects, because the scope of an immutable object is limited as possible. It will make our programming easier and more robust.

  The programming experts from other languages also know we need use immutable data as more as possible: Joshua Bloch,the author of Effective Java, said, “If an object is immutable, it can be in only one state, and you win big.You never have to worry about what state the object is in, and you can share it freely, with no need for synchronization.” Scott Meyers, Effective C++, Item 3: [Use _const_ whenever possible](http://codeidol.com/cpp/effective-cpp/Accustoming-Yourself-to-C/Item-3-Use-const-whenever-possible/). Other languages also use immutable data frequently, such like Python, the number/string/tuple types are immutable data, the String build-in class in Java is immutable too. But immutable data is inconvenient in some situation:

1.  Sometime we need our objects to share information with other objects that it doesn’t know about. If this shared object is immutable, it will create a new object when modify its data, but other object still gets the information from this old object, there will be trouble.
2.  Because every time we change our data, we need create a new data for it,  it will cause wasting more storage in our memory, we need use some mechanism to deal with this problem, the string object in Python/Java using String Interning mechanism (e.g. implement of flyweight design pattern) to solve this problem. It will bring us more complexity.

 

Pure function
-------------

All functions are pure, it's mean one function only do one thing, As we know, the most valuable quote in Unix philosophy is "Do one thing and do it well". It will make program more readable and reusable.  

Recursion
---------

_Iteration in function language is not well supported, because a loop counter would constitute mutable state, so recursion_ is heavily used. If you need a for loop in Scheme, you need build it by yourself \[code\](define-syntax while (syntax-rules () ((\_ pred b1 ...) (let loop () (when pred b1 ... (loop)))))) (define-syntax for (syntax-rules () ((\_ (i from to) b1 ...) (let loop((i from)) (when (< i to) b1 ... (loop (1+ i)))))))\[/code\] Functional language often use tail call optimization to ensure that heavy recursion does not consume excessive memory.

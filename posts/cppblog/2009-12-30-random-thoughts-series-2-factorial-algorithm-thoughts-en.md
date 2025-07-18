---
title: "Random Thoughts Series 2 - Factorial Algorithm Thoughts"
date: 2009-12-30 00:00:00+08:00
draft: false
categories: []
tags: ['Original']
author: "guanlan"
---

by [guanlan](http://www.cppblog.com/xguru/archive/2009/12/29/104344.html)[](http://topic.csdn.net/t/20030916/20/2267097.html)

Factorial again, this is an old topic, right? Without even thinking, a simple recursion will do!

![](/img/None.gif)int factorial(int n)  
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) if( n == 1)  
![](/img/InBlock.gif) return 1;  
![](/img/InBlock.gif) return n * factorial(n-1);  
![](/img/ExpandedBlockEnd.gif)}

Or you think recursion isn't as efficient as [tail recursion](http://en.wikipedia.org/wiki/Tail_recursion), so with a stroke of your pen:

![](/img/None.gif)long fact_iter(long product, long counter, long maxcount)   
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){   
![](/img/InBlock.gif) return (counter > maxcount) ? product : fact_iter(product*counter, counter+1, maxcount);  
![](/img/ExpandedBlockEnd.gif)}   
![](/img/None.gif)  
![](/img/None.gif)long factorial(long n)   
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) return fact_iter(1, 1, n);   
![](/img/ExpandedBlockEnd.gif)}

  
Or maybe you've read in "Code Complete": "If a programmer working for me used recursion to calculate factorial, I'd rather replace them."  
Using recursion to calculate factorial is slow, unpredictable in terms of memory usage during runtime, and difficult to understand. So you change the recursion to a loop statement.  
  

![](/img/None.gif)int factorial(int n)  
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) int result = 1;  
![](/img/InBlock.gif) for(int i = 2 ; i <= n; i++)  
![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) ![](/img/dot.gif){  
![](/img/InBlock.gif) result = result * i;  
![](/img/ExpandedSubBlockEnd.gif) }  
![](/img/InBlock.gif) return result;  
![](/img/ExpandedBlockEnd.gif)}

When you write this code, don't you feel something is missing?  
  
Testing on my 32-bit environment, it overflows when calculating 33!, so you say, well that's because int is too small, so you switch to long double. Test it again - what is this? It still doesn't work when the numbers get a bit larger.  
  
Then let's use linked lists or arrays instead. Linked lists are too slow, so let's use arrays.[](http://topic.csdn.net/t/20030916/20/2267097.html)

![](/img/None.gif)int factorial2(int n,int a[])  
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){   
![](/img/InBlock.gif) int carry;  
![](/img/InBlock.gif) int digit = 1;  
![](/img/InBlock.gif) a[0] = 1;  
![](/img/InBlock.gif) int temp;  
![](/img/InBlock.gif) for(int i = 2; i <= n; ++i)  
![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) ![](/img/dot.gif){  
![](/img/InBlock.gif) for(int j = 1, carry = 0; j <= digit; ++j)   
![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) ![](/img/dot.gif){  
![](/img/InBlock.gif) temp = a[j-1] * i + carry;  
![](/img/InBlock.gif) a[j-1] = temp % 10;  
![](/img/InBlock.gif) carry = temp / 10;  
![](/img/ExpandedSubBlockEnd.gif) }  
![](/img/InBlock.gif) while(carry)   
![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) ![](/img/dot.gif){  
![](/img/InBlock.gif) a[++digit-1] = carry % 10;  
![](/img/InBlock.gif) carry /= 10;  
![](/img/ExpandedSubBlockEnd.gif) }  
![](/img/ExpandedSubBlockEnd.gif) }  
![](/img/InBlock.gif) return --digit;  
![](/img/ExpandedBlockEnd.gif)}

This algorithm simulates the manual calculation process, saves the result in array a, and returns the number of digits in the result.

Are you feeling light-headed at this point? Please hold on for a moment.  
  
What if I need a scientific notation expression for a large number above 100,000? Or ask you, what is the third digit from the left of N! at the 100,000 level? Uh, isn't this a mathematician's job? Cheer up and challenge yourself! What real programmers need is this spirit of getting to the bottom of things.  
Let's try mathematical analysis methods. James Stirling, a Scottish mathematician, gave this limit formula more than 280 years ago:

![](/img/1.JPG)

This formula can calculate the approximate value of n! at extremely fast speed, and can also be used to infinitely approach the exact result. Detailed introduction and proof process is [here](http://mathworld.wolfram.com/StirlingsApproximation.html) or [here](http://zh.straightworldbank.com/wiki/%E6%96%AF%E7%89%B9%E6%9E%97%E5%85%AC%E5%BC%8F).  
  
**Stirling Series Formula**

![](/img/2.png)  
  
The following code calculates the scientific notation representation of large number N!  

![](/img/None.gif)struct bigNum   
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) double n; //mantissa  
![](/img/InBlock.gif) int e; //exponent  
![](/img/ExpandedBlockEnd.gif)};  
![](/img/None.gif)void factorial3(struct bigNum *p,int n)  
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) double logx,s,item;//s: sum of series, item: each term of series  
![](/img/InBlock.gif) int i;  
![](/img/InBlock.gif) logx = n* log10((double)n/E);  
![](/img/InBlock.gif) p->e = (int)(logx); p->n= pow(10.0, logx-p->e);  
![](/img/InBlock.gif) p->n *= sqrt( 2* PI* (double)n);  
![](/img/InBlock.gif) for (item=1.0,s=0.0,i=0;i<sizeof(a1)/sizeof(double);i++)  
![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) ![](/img/dot.gif){  
![](/img/InBlock.gif) s += item * a1[i];  
![](/img/InBlock.gif) item /= (double)n;  
![](/img/ExpandedSubBlockEnd.gif) }  
![](/img/InBlock.gif) p->n *=s;  
![](/img/ExpandedBlockEnd.gif)}

  
  
The following is the asymptotic expansion of the logarithm of factorial  
![](/img/3.png)  

![](/img/None.gif)void factorial3b(struct bigNum *p,int n)  
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) double logR;  
![](/img/InBlock.gif) double s,item;  
![](/img/InBlock.gif) int i;  
![](/img/InBlock.gif) logR=0.5*log(2.0*PI)+((double)n+0.5)*log(n)-(double)n;  
![](/img/InBlock.gif)   
![](/img/InBlock.gif) for (item=1/(double)n,s=0.0,i=0;i<sizeof(a2)/sizeof(double);i++)  
![](/img/ExpandedSubBlockStart.gif)![](/img/ContractedSubBlock.gif) ![](/img/dot.gif){  
![](/img/InBlock.gif) s+= item * a2[i];  
![](/img/InBlock.gif) item /= (double)(n)* (double)n;   
![](/img/ExpandedSubBlockEnd.gif) }  
![](/img/InBlock.gif) logR+=s;  
![](/img/InBlock.gif) p->e = (int)( logR / log(10));//change of base formula  
![](/img/InBlock.gif) p->n = pow(10.00, logR/log(10) - p->e);  
![](/img/ExpandedBlockEnd.gif)}

Calculating the number of digits in a factorial is also particularly simple:

![](/img/None.gif)double getFactorialLength(int n)  
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) return (n * log(double(n)) - n + 0.5 * log(2.0 * n * PI )) / log(10.0)+1;  
![](/img/ExpandedBlockEnd.gif)}

This calculates an approximate number of digits, or you can improve it by using the ceil function to find the smallest integer not less than the given real number.

![](/img/None.gif)int getFactorialLength(int n)  
![](/img/ExpandedBlockStart.gif)![](/img/ContractedBlock.gif)![](/img/dot.gif){  
![](/img/InBlock.gif) if( n == 1 )  
![](/img/InBlock.gif) return 1;  
![](/img/InBlock.gif) else  
![](/img/InBlock.gif) return (int)ceil((N*log(N)-N+log(2*N*PI)/2)/log(10));  
![](/img/ExpandedBlockEnd.gif)}

  
At this point, you can't help but exclaim: the **most brilliant, most essential, most fundamental** thing in computer science is still **mathematics**!  
  
  
![](/img/800px-Mandelpart2.jpg)  
[Mandelbrot set](http://en.wikipedia.org/wiki/Mandelbrot_set) boundary  
Finally, let me end this essay with Russell's words:  
Mathematics, rightly viewed, possesses not only truth, but supreme beauty — a beauty cold and austere, like that of sculpture, without appeal to any part of our weaker nature, without the gorgeous trappings of painting or music, yet sublimely pure, and capable of a stern perfection such as only the greatest art can show. The true spirit of delight, the exaltation, the sense of being more than Man, which is the touchstone of the highest excellence, is to be found in mathematics as surely as poetry.

References  
1.[Tom M. Apostol. "Mathematical Analysis"  
](http://www.verycd.com/topics/2786508/)2[.Steve McConnell. "CODE COMPLETE, Second Edition"  
](http://www.verycd.com/topics/147539/)3.<http://en.wikipedia.org/wiki/Stirling_approximation#History>  
4.<http://mathworld.wolfram.com/StirlingsApproximation.html>  
5.<http://zh.straightworldbank.com/wiki/%E6%96%AF%E7%89%B9%E6%9E%97%E5%85%AC%E5%BC%8F>


---

*Original Chinese version: [http://www.cppblog.com/xguru/archive/2009/12/30/104344.html](http://www.cppblog.com/xguru/archive/2009/12/30/104344.html)*

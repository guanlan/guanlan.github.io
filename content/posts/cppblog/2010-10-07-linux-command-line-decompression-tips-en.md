---
title: "[Tips] Linux Command Line Decompression Tips"
date: 2010-10-07 00:00:00+08:00
draft: false
categories: ['Linux']
tags: ['tips']
author: "guanlan"
---

Everyone finds it frustrating that Linux has numerous compression formats, and each format corresponds to different commands, which is quite a headache.  
Let me introduce a method to you:  
Add this to your bashrc:  
  

ex () {  
if [ -f $1 ] ; then  
case $1 in  
*.tar.bz2) tar xjf $1 ;;  
*.tar.gz) tar xzf $1 ;;  
*.bz2) bunzip2 $1 ;;  
*.rar) rar x $1 ;;  
*.gz) gunzip $1 ;;  
*.tar) tar xf $1 ;;  
*.tbz2) tar xjf $1 ;;  
*.tgz) tar xzf $1 ;;  
*.zip) unzip $1 ;;  
*.Z) uncompress $1 ;;  
*.7z) 7z x $1 ;;  
*) echo "Unable to extract '$1' file!!" ;;  
esac  
else  
echo "'$1' is not a valid file!"  
fi  
}  

  
![](/img/ex.png)  
  
To decompress files, simply type "ex [compressed file]". If you have other compressed file formats, you can add them yourself.  
Say goodbye to annoying various decompression commands from now on.  



---

*Original link: [http://www.cppblog.com/xguru/archive/2010/10/07/128952.html](http://www.cppblog.com/xguru/archive/2010/10/07/128952.html)*

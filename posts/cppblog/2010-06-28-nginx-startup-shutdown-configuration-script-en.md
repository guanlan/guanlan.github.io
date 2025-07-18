---
title: "nginx Startup, Shutdown and Configuration Script"
date: 2010-06-28 00:00:00+08:00
draft: false
categories: ['Nginx']
tags: ['original']
author: "guanlan"
---

2010-12-29-update: Found a newer version provided by jason, available [here](http://code.google.com/p/nginx-init-ubuntu/source/browse/tags/2.0.0-RC2/nginx?spec=svn30&r=30)   
  
  
I searched online for several versions but none of them worked on Ubuntu  
So I modified jackbillow's version myself, and it feels pretty good to use.  
  
  
  
Usage: nginx.sh {start|stop|conf|restart}  
//start|stop|configure|restart  
  
Note: Must be run with administrator privileges  
  
  

################################################  
#!/bin/bash  
# v.0.0.3  
# create by jackbillow at 2007.10.15  
# redevelop by guanlan at 2010.6.28  
# On Ubuntu 10.04  
# nginx - This shell script takes care of starting and stopping nginx.  
#  
# description: nginx [engine x] is light http web/proxy server  
# that answers incoming ftp service requests.  
###############################################  
  
nginx_path="/usr/local/nginx"  
nginx_pid="/usr/local/nginx/logs/nginx.pid"  
prog="nginx"  
  
RETVAL=0  
  
  
start() {  
# Start daemons.  
if [ -e $nginx_path/conf/nginx.conf ];then  
echo -n $"Starting $prog: "  
$nginx_path/sbin/nginx -c $nginx_path/conf/nginx.conf &  
RETVAL=$?  
[ $RETVAL -eq 0 ] && {  
echo Start "$prog" successfully!  
}  
else  
RETVAL=1  
fi  
return $RETVAL  
}  
# Stop daemons.  
stop() {  
echo -n $"Stopping $prog\n"  
sudo killall -9 nginx  
RETVAL=$?  
}  
# See how we were called.  
  
conf(){  
gvim "$nginx_path/conf/nginx.conf"  
}  
case "$1" in  
start)  
start  
;;  
stop)  
stop  
;;  
conf)  
conf  
;;   
restart)  
stop  
start  
;;  
*)  
echo $"Usage: $0 {start|stop|conf|restart}"  
echo $"Your may need root privilege to execute this script!"  
exit 1  
esac  
exit $RETVAL  

  
\--EOF--  



---

*Original link: [http://www.cppblog.com/xguru/archive/2010/06/28/118868.html](http://www.cppblog.com/xguru/archive/2010/06/28/118868.html)*

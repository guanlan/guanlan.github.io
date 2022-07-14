# How to Design a Scalable Rate Limiting Algorithm


What is rate limiting?
----------------------

Rate limiting protects your APIs from inadvertent or malicious overuse by limiting how often each user can call the API. Without rate limiting, each user may make a request as often as they like, leading to "spikes" of requests that starve other consumers. Once enabled, rate limiting can only perform a fixed number of requests per second. A rate limiting algorithm helps automate the process.

![rate limiting enabled at 2 requests/min](https://konghq.com/wp-content/uploads/2017/12/01-rate-limit-kong.png)

In the example chart, you can see how rate limiting blocks requests over time. The API was initially receiving four requests per minute, shown in green. When we enabled rate limiting at 12:02, the system denied additional requests, shown in red.


Why is rate limiting used?
--------------------------

Rate limiting is very important for public APIs where you want to maintain a good quality of service for every consumer, even when some users take more than their fair share. Computationally-intensive endpoints are particularly in need of rate limiting --- especially when served by auto-scaling, or by pay-by-the-computation services like [AWS Lambda](https://docs.konghq.com/hub/kong-inc/aws-lambda). You also may want to rate limit APIs that serve sensitive data because this could limit the data exposed if an attacker gains access in some unforeseen event.

Rate limiting can be used to accomplish the following:

-   Avoid resource starvation: Rate limiting can improve the availability of services and help avoid friendly-fire denial-of-service (DoS) attacks.
-   Cost management: Rate limiting can be used to enforce cost controls, (for example) preventing surprise bills from experiments or misconfigured resources .
-   Manage policies and quotas: Rate limiting allows for the fair sharing of a service with multiple users.
-   Control flow: For APIs that process massive amounts of data, rate limiting can be used to control the flow of that data. It can allow for the merging of multiple streams into one service or the equally distribution of a single stream to multiple workers.
-   Security: Rate limiting can be used as defense or mitigation against some common attacks.

What kind of attacks can rate limiting prevent?
-----------------------------------------------

Rate limiting can be critical in protecting against a variety of bot-based attacks, including:

-   DoS and DDoS (distributed denial-of-service) attacks
-   Brute force and credential stuffing attacks
-   Web scraping or site scraping

How do you enable rate limiting?
--------------------------------

There are many different ways to enable rate limiting, and we will explore the pros and cons of varying rate limiting algorithms. We will also explore the issues that come up when scaling across a cluster. Lastly, we'll show you an example of how to quickly set up rate limiting using [Kong Gateway](https://konghq.com/kong), which is the most popular open-source [API gateway](https://konghq.com/learning-center/api-gateway/what-is-an-api-gateway).

Want to set up rate limiting for your API gateway with clicks instead of code? [Try Konnect for free >>](https://konghq.com/kong-konnect)

If you're interested in rate limiting for [Kubernetes](https://konghq.com/solutions/kubernetes-ingress) services, check out this video:

Rate limiting algorithms
------------------------

There are various algorithms for API rate limiting, each with its benefits and drawbacks. Let's review each of them so you can pick the ideal rate limiting design option for your API needs.

### Leaky Bucket

[Leaky bucket](https://en.wikipedia.org/wiki/Leaky_bucket) (closely related to [token bucket](https://en.wikipedia.org/wiki/Token_bucket)) is an algorithm that provides a simple, intuitive approach to rate limiting via a queue, which you can think of as a bucket holding the requests. When registering a request, the system appends it to the end of the queue. Processing for the first item on the queue occurs at a regular interval or first in, first out (FIFO). If the queue is full, then additional requests are discarded (or leaked).

![rate limiting capacity](https://konghq.com/wp-content/uploads/2017/12/02-rate-limit-kong.png.webp)

This algorithm's advantage is that it smooths out bursts of requests and processes them at an approximately average rate. It's also easy to implement on a single server or[ load balancer](https://konghq.com/blog/dear-load-balancers) and is memory efficient for each user, given the limited queue size.

However, a burst of traffic can fill up the queue with old requests and starve more recent requests from being processed. It also provides no guarantee that requests get processed in a fixed amount of time. Additionally, if you load balance servers for fault tolerance or increased throughput, you must use a policy to coordinate and enforce the limit between them. We will come back to the challenges of distributed environments later.

### Fixed Window

The system uses a window size of n seconds (typically using human-friendly values, such as 60 or 3600 seconds) to track the fixed window algorithm rate. Each incoming request increments the counter for the window. It discards the request if the counter exceeds a threshold. The current timestamp floor typically defines the windows, so 12:00:03, with a 60-second window length, would be in the 12:00:00 window.

![request 3 denied](https://konghq.com/wp-content/uploads/2017/12/03-rate-limit-kong.png)

This algorithm's advantage is that it ensures more recent requests get processed without being starved by old requests. However, a single burst of traffic that occurs near the boundary of a window can result in the processing of twice the rate of requests because it will allow requests for both the current and next windows within a short time. Additionally, if many consumers wait for a reset window, they may stampede your API at the same time at the top of the hour.

### Sliding Log

Sliding Log rate limiting involves tracking a time-stamped log for each consumer's request. The system stores these logs in a time-sorted hash set or table. It also discards logs with timestamps beyond a threshold. When a new request comes in, we calculate the sum of logs to determine the request rate. If the request would exceed the threshold rate, then it is held.

![request at 12:00:35 hold](https://konghq.com/wp-content/uploads/2017/12/04-rate-limit-kong.png.webp)

The advantage of this algorithm is that it does not suffer from the boundary conditions of fixed windows. Enforcement of the rate limit will remain precise. Since the system tracks the sliding log for each consumer, you don't have the stampede effect that challenges fixed windows. However, it can be costly to store an unlimited number of logs for every request. It's also expensive to compute because each request requires calculating a summation over the consumer's prior requests, potentially across a cluster of servers. As a result, it does not scale well to handle large bursts of traffic or denial of service attacks.

### Sliding Window

Sliding Window is a hybrid approach that combines the fixed window algorithm's low processing cost and the sliding log's improved boundary conditions. Like the fixed window algorithm, we track a counter for each fixed window. Next, we account for a weighted value of the previous window's request rate based on the current timestamp to smooth out bursts of traffic. For example, if the current window is 25% through, we weigh the previous window's count by 75%. The relatively small number of data points needed to track per key allows us to scale and distribute across large clusters.

![](https://konghq.com/wp-content/uploads/2017/12/05-rate-limit-kong.png)

We recommend the sliding window approach because it gives the flexibility to scale rate limiting with good performance. The rate windows are an intuitive way to present rate limit data to API consumers. It also avoids the starvation problem of the leaky bucket and the bursting problems of fixed window implementations.

Rate limiting in distributed systems
------------------------------------

### Synchronization Policies

If you want to enforce a global rate limit when using a [cluster of multiple nodes](https://konghq.com/learning-center/api-gateway/api-gateways-for-high-availability-clusters), you must set up a policy to [enforce it](https://konghq.com/blog/using-instaclustr-and-cassandra-with-kong). If each node were to track its rate limit, a consumer could exceed a global rate limit when sending requests to different nodes. The greater the number of nodes, the more likely the user will exceed the global limit.

The simplest way to enforce the limit is to set up sticky sessions in your load balancer so that each consumer gets sent to exactly one node. The disadvantages include a lack of fault tolerance and scaling problems when nodes get overloaded.

A better solution that allows more flexible load-balancing rules is to use a centralized data store such as Redis or[ Cassandra](https://konghq.com/blog/using-instaclustr-and-cassandra-with-kong). A centralized data store will collect the counts for each window and consumer. The two main problems with this approach are increased latency making requests to the data store and race conditions, which we will discuss next.

![load balancer requests going into nodes](https://konghq.com/wp-content/uploads/2017/12/06-rate-limit-kong.png)

### Race Conditions

One of the most extensive problems with a centralized data store is the potential for [race conditions](https://en.wikipedia.org/wiki/Race_condition) in [high concurrency](https://en.wikipedia.org/wiki/Concurrency_(computer_science)) request patterns. This issue happens when you use a naïve "get-then-set" approach, wherein you retrieve the current rate limit counter, increment it, and then push it back to the datastore. This model's problem is that additional requests can come through in the time it takes to perform a full cycle of read-increment-store, each attempting to store the increment counter with an invalid (lower) counter value. This allows a consumer to send a very high rate of requests to bypass rate limiting controls.

![load balancer requests going into nodes and then counter to Redis](https://konghq.com/wp-content/uploads/2017/12/06-2-rate-limit-kong.png)

One way to avoid this problem is to put a "lock" around the key in question, preventing any other processes from accessing or writing to the counter. A lock would quickly become a significant performance bottleneck and does not scale well, mainly when using remote servers like Redis as the backing datastore.

A better approach is to use a "set-then-get" mindset, relying on atomic operators that implement locks in a very performant fashion, allowing you to quickly increment and check counter values without letting the atomic operations get in the way. 

### Optimizing for Performance

The increased [latency](https://konghq.com/blog/observability-kubernetes-kong) is another disadvantage of using a centralized data store when checking the rate limit counters. Unfortunately, even checking a fast data store like Redis would result in milliseconds of additional latency for every request.

Make checks locally in memory to make these rate limit determinations with minimal latency. To make local checks, relax the rate check conditions and use an eventually consistent model. For example, each node can create a data sync cycle that will synchronize with the centralized data store. Each node periodically pushes a counter increment for each consumer and window to the datastore. These pushes atomically update the values. The node can then retrieve the updated values to update its in-memory version. This cycle of converge → diverge → reconverge among nodes in the cluster is eventually consistent.

![](https://konghq.com/wp-content/uploads/2017/12/07-rate-limit-kong.png)

The periodic rate at which nodes converge should be configurable. Shorter sync intervals will result in less divergence of data points when spreading traffic across multiple nodes in the cluster (e.g., when sitting behind a round robin balancer). Whereas longer sync intervals put less read/write pressure on the datastore and less overhead on each node to fetch new synced values. 

Quickly set up rate limiting with Kong API Gateway
--------------------------------------------------

Kong is an [open source API gateway](https://konghq.com/kong) that makes it very easy to build scalable services with rate limiting. It scales perfectly from single Kong Gateway nodes to massive, globe-spanning Kong clusters.

Kong Gateway sits in front of your APIs and is the main entry point to your upstream APIs. While processing the request and the response, Kong Gateway will execute any plugin that you have decided to add to the API.

![kong gateway](https://konghq.com/wp-content/uploads/2017/12/illustration2.png)

Kong API Gateway's rate limiting plug-in is highly configurable. It:

-   Offers flexibility to define multiple rate limit windows and rates for each API and consumer
-   Includes support for local memory, Redis, Postgres, and Cassandra backing datastores
-   Offers a variety of data synchronization options, including synchronous and eventually consistent models

You can quickly [try Kong Gateway](https://konghq.com/install#kong-gateway) on one of your dev machines to test it out. My favorite way to get started is to use the [AWS cloud formation template](https://getkong.org/install/aws-cloudformation) since I get a pre-configured dev machine in just a few clicks. Just choose one of the HVM options, and set your instance sizes to use t2.micro as these are affordable for testing. Then ssh into a command line on your new instance for the next step.

### Adding an API on Kong Gateway

The next step is [adding an API](https://konghq.com/blog/set-up-kong-gateway) on Kong Gateway using the admin API, which can be done by setting up a Route and a Service entity. We will use [httpbin](https://httpbin.org/), a free testing service for APIs, as our example upstream service,. The get URL will mirror back my request data as JSON. We also assume Kong Gateway is running on the local system at the default ports.


```bash
curl  -i  -X  POST
  --url http://localhost:8001/services/
  --data  'name=httpbin
  --data 'url=http://httpbin.org/get'

curl  -i  -X  POST
  --url http://localhost:8001/services/httpbin/routes
  --data  'paths[]=/test'
```

Now Kong Gateway is aware that every request sent to "/test" should be proxied to httpbin. We can make the following request to Kong Gateway on its proxy port to test it:

```bash
curl http://localhost:8000/test
{
"args":  {},
"headers":  {
"Accept":  "*/*",
"Connection":  "close",
"Host":  "httpbin.org",
"User-Agent":  "curl/7.51.0",
"X-Forwarded-Host":  "localhost"
},
"origin":  "localhost, 52.89.171.202",
"url":  "http://localhost/get"
}
```

It's alive! Kong Gateway received the request and proxied it to httpbin, which has mirrored back the headers for my request and my origin IP address.

### Adding Basic Rate-Limiting

Let's go ahead and protect it from an excessive number of requests by adding the rate-limiting functionality using the community edition [Rate-Limiting plugin](https://getkong.org/plugins/rate-limiting), with a limit of 5 requests per minute from every consumer:

```bash
curl  -i  -X  POST http://localhost:8001/services/httpbin/plugins/
-d  "name=rate-limiting"
-d  "config.minute=5"
```

If we now make more than five requests, Kong Gateway will respond with the following error message:

```bash
curl http://localhost:8000/test
{
"message":"API rate limit exceeded"
}
```

Looking good! We have added an API on Kong Gateway, and we added rate-limiting in just two HTTP requests to the admin API.

It defaults to rate limiting by IP address using fixed windows and synchronizes across all nodes in your cluster using your default datastore. For other options, including rate limiting per consumer or using another datastore like Redis, please see the [documentation](https://getkong.org/plugins/rate-limiting).

For a more detailed tutorial, check out [Protecting Services With Kong Gateway Rate Limiting >>](https://konghq.com/blog/kong-gateway-rate-limiting)

Better performance with advanced rate limiting and Konnect
----------------------------------------------------------

The [Advanced Rate Limiting plugin](https://docs.konghq.com/hub/kong-inc/rate-limiting-advanced) adds support for the sliding window algorithm for better control and performance. The sliding window prevents your API from being overloaded near window boundaries, as explained in the sections above. For low latency, it uses an in-memory table of the counters and can synchronize across the cluster using asynchronous or synchronous updates. This gives the latency of local thresholds and is scalable across your entire cluster.

The first step is [start a free trial of Konnect](https://konghq.com/kong-konnect). You can then configure the rate limit, the window size in seconds, and how often to sync the counter values. It's straightforward to use, and you can get this robust control with a simple API call:

```bash
curl  -i  -X  POST http://localhost:8001/services/httpbin/plugins
-d  "name=rate-limiting"
-d  "config.limit=5"
-d  "config.window_size=60"
-d  "config.sync_rate=10"
```

The enterprise edition also supports Redis Sentinel, which makes Redis highly available and more fault-tolerant. You can read more in the [rate limiting plugin documentation](https://docs.konghq.com/hub/kong-inc/rate-limiting).

Other features include an admin GUI, more security features like role-based access control, analytics and professional support. If you're interested in learning more about the Enterprise edition, just [contact](https://konghq.com/contact) Kong's sales team to [request a demo](https://konghq.com/request-demo).

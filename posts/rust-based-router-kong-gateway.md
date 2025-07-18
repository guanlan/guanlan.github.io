---
title: "Deep Dive into Kong Gateway's New Rust-Based Router"
date: 2024-07-18
author: "guanlan"
tags: ["Kong", "Rust"]
---
## What is the Expressions Router?

The router component in the Kong Gateway is a crucial element for traffic handling, allowing the definition of specific matching rules to identify and process client requests. As a core component of the gateway, the router plays a vital role in ensuring the functionality, flexibility, security as well as performance of the gateway.

![Kong gateway](/img/668eda3d-image7-2.png?auto=format&fit=max&w=2560)

In the 3.0 version update of the Kong API Gateway, the routing system was completely rewritten in Rust — a memory-safe and efficient language. A concise DSL (Domain Specific Language) was designed to define routing rules efficiently, called the "Expressions Router." The new design reduced the routing construction time by 75% when handling up to 10,000 routing rules, significantly decreasing from 20 seconds to 5 seconds.

![match](/img/668eda68-image5-3.png?auto=format&fit=max&w=2560)

### Example: Exact Match

```json
lower(http.path) == "/foo/bar"
```

### Example: Regex Match

```json
http.path ~ r#"/foo/bar/\d+"#
```

We utilized the high-performance [pest](https://pest.rs/) library from the Rust ecosystem to parse our DSL, with the entire grammar description being about 40 lines.

![pest_dsl](/img/668edaf2-image6-2.png?auto=format&fit=max&w=2560)

In Kong, you can add an Expressions route through the Admin API POST method.

```bash
curl --request POST \
  --url http://localhost:8001/services/example-service/routes \
  --header 'Content-Type: multipart/form-data' \
  --form-string 'expression=(http.path == "/mock" || net.protocol == "https")'
```

## Router Optimization

This DSL offers many convenient features, such as prefix matching (`^=`), suffix matching (`=^`), and IP address ranges in IpCidr format, allowing users to avoid expensive regular expressions. The enhanced expressive power can describe complex routing requirements in a single routing rule, reducing the number of rules needed.

The new design optimizes the order of checks and allows bypassing costly checks when appropriate. Expression routes are always evaluated in descending order of priority. Therefore, when configuring routes, you should set a higher priority for more likely matches to improve efficiency.

- Example of a likely match route.

  ```json
  expression: http.path == "/likely/matched/request/path"
  priority: 100
  ```

- Example of an unlikely match route.

  ```json
  expression: http.path == "/unlikely/matched/request/path"
  priority: 50
  ```

Additionally, version 3.0 introduces condition-triggered partial route reconstruction, effectively avoiding the time consumption of global route reconstruction. In scenarios with many routes, benchmark tests show that the P99 time for route reconstruction reduced from 1.5 seconds to 0.1 seconds.

For more optimizations, refer to Kong’s official documentation.

## Migration Path Between Old and New Routes (New Feature in Version 3.7)

![img](/img/668edbee-image1-6.png?auto=format&fit=max&w=2560)

In the latest 3.7 version of Kong Gateway, the routing system has been further enhanced with a key feature: migration support for Expressions routes, allowing customers to run both traditional JSON-based routes and new Expressions routes in tandem.

![Youtube thumbnail](/img/maxresdefault.jpg)

Kong Gateway now supports configuring both JSON and Expressions routes in a single control plane, enabling teams to gradually migrate routes to the Expression language based on business needs. Comprehensive GUI support is also provided, with syntax highlighting and auto-completion.

![Youtube thumbnail](/img/maxresdefault.jpg)

This update ensures users can smoothly transition from the Traditional routing system to the new Expressions routing system without service interruption or complex operations. For those still using Traditional routing methods, we strongly recommend upgrading to the new Expressions routes for a more efficient and flexible routing management experience.

## Shared the Same Codebase for Front-end and Backend

An interesting technical highlight is developing a resty-router library on the backend, invoking Rust implementations through FFI, and integrating it into OpenResty’s backend ecosystem.

Using WebAssembly (WASM) via [wasm-bindgen](https://rustwasm.github.io/docs/wasm-bindgen/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/), we added macros in Rust code to enable the core functions used in modern browsers. This allowed us to encapsulate the core developed in Rust into a fully-typed TypeScript codebase, and achieve complex features like interactive editors and playgrounds after integration with Vue components.

### Example of frontend WASM interface:

```json
#[wasm_bindgen(js_name = addMatcher)]
pub unsafe fn add_matcher(
    &mut self,
    priority: usize,
    uuid: &str,
    atc: &str,
) -> JsOptionalErrorMessage {
    match (*self.r).add_matcher(priority, Uuid::from_str(uuid).unwrap_throw(), atc) {
        Ok(_) => JsValue::undefined(),
        Err(err) => err.into(),
    }
    .into()
}
```

### Example of backend FFI interface:

```json
#[no_mangle]
// uuid must be ASCII representation of 128-bit UUID
pub unsafe extern "C" fn router_add_matcher(
    router: &mut Router,
    priority: usize,
    uuid: *const i8,
    atc: *const i8,
    errbuf: *mut u8,
    errbuf_len: *mut usize,
) -> bool {
    let uuid = ffi::CStr::from_ptr(uuid as *const c_char).to_str().unwrap();
    let atc = ffi::CStr::from_ptr(atc as *const c_char).to_str().unwrap();
    let errbuf = from_raw_parts_mut(errbuf, ERR_BUF_MAX_LEN);
    let uuid = Uuid::try_parse(uuid).expect("invalid UUID format");
    if let Err(e) = router.add_matcher(priority, uuid, atc) {
        let errlen = min(e.len(), *errbuf_len);
        errbuf[..errlen].copy_from_slice(&e.as_bytes()[..errlen]);
        *errbuf_len = errlen;
        return false;
    }
    true
}
```

Thanks to the common library used by both the frontend and backend, users can intuitively write Expressions with syntax highlighting and auto-completion in the browser and test and verify routing rules in the playground. The frontend UI runs the same code in the browser as Gateway would have used during proxying, eliminating any chance of implementation mismatch and potential inconsistent behaviors.

You may visit the [Expressions Language reference](https://docs.konghq.com/gateway/latest/kong-enterprise/expressions-language/) page to learn more about the features of the language, as well as [How to Configure Routes using Expressions](https://docs.konghq.com/gateway/latest/kong-enterprise/how-to-configure-routes-using-expressions/) to learn more about how to get started routing traffic with expressions inside Kong Gateway.

---
layout    : post
category  : テク
title     : Filtering unrelated frames from stack trace - with application.properties
tags      : [springboot]
date      : 2021-03-12 15:17:00 +8
published : true
image     : /assets/2021/2021-03-12-stacktrace1.png
has_thumb : true
excerpt   : In java, tracing stack trace is our daily life. Can we have a clear stack trace with all frames unrelated removed?
lang      : en-US
reference : [
    'https://dzone.com/articles/filtering-stack-trace-hell',
    'https://stackoverflow.com/q/35076096'
]
---

In java, tracing stack trace is our daily life. However, the more frameworks we use, the longer the stack trace become.

![vanilla flavor stack trace](/assets/2021/2021-03-12-stacktrace1.png)

What if all frames unrelated are gone?

<!--more-->

Yes, our great (and heavy) Spring frameworks has this feature built-in.

Spring framework utilize Logback as its default log provider. You can find some discusions by searching `logback stacktrace filter` on StackOverflow.

But, as of written, all those discusions are achieved by overriding defaults with xml file.

## Why not XML

With Spring we usually provide configurations through one or more `application.properties`, which then merged and auto-completed by Spring.

XML-based configuration, however, require us to inherit or include parent configurations, setup the logging level per packages, define the output path and more. Since we aren't using the configuration provided by Spring, Spring has no way inject default for us.

It has it's pros on some aspect, but it extensively complex our setup while we only want a slightly shorter stack trace compare to default. To minimum the effort, we will stick with the properties file way. If you are looking for a full configuration guide, this post is not for you.

## Background

Having a look on Spring's [defaults.xml][src-logback-default], logging pattern is provided by property *CONSOLE_LOG_PATTERN* and format of exception is controlled by *LOG_EXCEPTION_CONVERSION_WORD*, with `%wEx` as default.

The `%wEx` is bind to Spring's `ExtendedWhitespaceThrowableProxyConverter`, which has nothing but line format changed, according to [source][src-logback-wEx]. Hence we can assert it has identical *EX_DISPLAY_EVAL* syntax compare to its super: `ExtendedThrowableProxyConverter`.

## Blend together

Have a look on Logback's document:

> This conversion word can also use evaluators to test logging events against a given criterion before creating the output. For example, using **%ex{full, EX_DISPLAY_EVAL}** will display the full stack trace of the exception only if the evaluator called *EX_DISPLAY_EVAL* returns a **negative** answer. Evaluators are described further down in this document.

The syntax `%wEx{full, PACKAGE_NAME...}` should exclude all frames matching to packages listed in PACKAGE_NAME.

In most case, those frames we don't want are:

```text
java.lang.reflect.Method
org.springframework.aop
org.springframework.security
org.springframework.transaction
org.springframework.web
sun.reflect
net.sf.cglib
ByCGLIB
```

We alos exclude those packages come with servlet container:

```text
io.undertow
org.apache.catalina
```

Once we put them together, the conversion word will be looks like `%wEx{full,java.lang.reflect.Method,...}`.

## Put the battery in

Now ew have the final conversion word, but where should we put on? Well, [document][doc-log-config] said the property `LOG_EXCEPTION_CONVERSION_WORD` is mapped to `logging.exception-conversion-word`, so we should have following lines in our properties file:

```properties
logging.exception-conversion-word=%wEx{\
    full, \
    java.lang.reflect.Method, \
    io.undertow, \
    org.apache.catalina, \
    org.springframework.aop, \
    org.springframework.security, \
    org.springframework.transaction, \
    org.springframework.web, \
    sun.reflect, \
    net.sf.cglib, \
    ByCGLIB \
}
```

## Start the engine

Everything is ready, it's time to go.

![light flavor stack trace](/assets/2021/2021-03-12-stacktrace2.png)

Weee! The stack trace is compressed to one third of the original, and we can even seen the root cause without a scroll!

[src-logback-default]: https://github.com/spring-projects/spring-boot/tree/master/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/logback/defaults.xml

[src-logback-wEx]: https://github.com/spring-projects/spring-boot/blob/master/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/logging/logback/ExtendedWhitespaceThrowableProxyConverter.java

[doc-log-config]: https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-custom-log-configuration

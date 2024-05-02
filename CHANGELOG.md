# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed
- `create` (both as a named export and the default export) is removed. Instead use `atom`.


## [1.0.0beta-12] - 2015-02-16

This version, compared to the previous one only adds deprecation notices that can be fixed by slight modifications. Underlying implementations are not changed.

### Deprecated

- `create` (both as a named export and the default export) is marked as deprecated, and it has been renamed to `atom`.
> Before:
> ```js
> import create from 'xoid'
>// or
> import { create } from 'xoid'
> ```
> After:
> ```js
> import { atom } from 'xoid'
> ```
- `inject` and `effect` exports are now exported from the root. They used to be exported from the `xoid/setup` route.
> Before:
> ```js
> import { effect, inject } from 'xoid/setup'
> ```
> After:
> ```js
> import { effect, inject } from 'xoid'
> ```

---
sidebar_position: 1
---

# Introduction

Nerest is an opinionated micro frontend framework/stack for building SSR applications with TypeScript, Fastify, JSON Schema and React. It is available as a single `@nerest/nerest` npm package.

## Table of Contents

Please note that these docs are a work in progress. Each section progresses through different stages of improvement, marked as follows:

- not started
- 🟡 - unfinished, either in terms of content or proofreading
- 🟢 - finished and proofread

### Tutorial

[🟢 Complete guide on how to:](/tutorial/index.md)

1. Set up a project
2. Create an app
3. Use data from request body
4. Add interactive previews
5. Add server-side functionality
6. Embed micro frontend in a facade
7. Prepare micro frontend for production

### How-to

- Embed Nerest micro frontend in another app
- Set up tests with Vitest
- Modify Fastify instance with plugins and custom routes
- Configure and use the Nerest logger
- Customize the preview
- [🟢 Migration guides](/how-to/migrations/index.md)

### Explanations

- Design principles
- Project structure
- Sharing dependencies
- [🟢 Community and resources](/explanations/community-and-resources.md)

### Reference

- Micro frontend HTTP API
- CLI
- App parts
  - Entry (`index.tsx`)
  - Schema (`schema.json`)
  - Examples (`examples/*.json`)
  - Props hook (`props.ts`)
- Build configuration
  - Environment variables
  - `build.json`
- Runtime configuration
  - Environment variables
  - `runtime.ts`
- Swagger and previews

## System

These docs follow the [Divio Documentation System](https://documentation.divio.com/).

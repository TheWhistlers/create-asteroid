---
title: Hello, Asteroid!
author: Asteroid
date: "2026-11-15"
updated: "2026-11-15"
category: 随笔
summary: 一篇介绍本站自动生成机制、代码高亮与目录式路由的示例文章。
keywords:
  - Vue 3
  - Vite
  - Markdown
  - 个人博客
references:
  - title: Vite 官方文档
    url: https://vite.dev/
  - title: Vue 3 组合式 API
    url: https://cn.vuejs.org/guide/introduction.html
  - title: x-markdown-vue
    url: https://github.com/element-plus-x/x-markdown
  - title: CommonMark 规范
    url: https://commonmark.org/
  - title: Vite glob 导入 
    url: https://vite.dev/guide/features.html#glob-import
---
# Hello, Asteroid!

Welcome to Asteroid, a simple static personal blog site generator.

This documents will help you start with Asteroid quickly.

## How to use Asteroid
- Put your Markdown file into `./docs` directory.
- Support access by path: `/hello` → `./docs/hello.md`.
- Support multi-level directory：`/guide/getting-started` → `./docs/guide/getting-started.md`.
- Redirect to `/error` when file not found.

YAML metadata will be displayed in right sections, instead of show in contents.

## Code block highlights

```ts
interface Post {
  title: string
  path: string
}

function greet(post: Post): string {
  return `Reading ${post.title} at ${post.path}`
}

console.log(greet({ title: 'Hello', path: '/hello' }))
```

```python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

## Tables

| Functions        | State |
| --------------- | ---- |
| Automatically load docs   | ✅   |
| Dark / Light theme switch | ✅   |
| Directory style routes      | ✅   |
| YAML Metadata   | ✅   |

> Quote block presentations. ——By me

## Document Metadata

Wirte a YAML block in the header of documents, authors, created time and references will be show on the right part.

```yaml
---
author: Asteroid
date: "2026-11-15"
keywords: [Vue 3, Vite]
references:
  - title: Vite Document
    url: https://vite.dev/
---
```

## Conventions

- First title `# Title` will be used as a title in overview page.
- Support GitHub Flavored Markdown Syntax.
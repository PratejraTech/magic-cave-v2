# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:css] [postcss] /Users/nullzero/repos-0x0/general-advent/src/index.css:186:3: The `shadow-frost` class does not exist. If `shadow-frost` is a custom class, make sure it is defined within a `@layer` directive."
  - generic [ref=e5]: /Users/nullzero/repos-0x0/general-advent/src/index.css:186:2
  - generic [ref=e6]: "184 | 185 | .wonderland-card { 186 | @apply bg-white/90 backdrop-blur-sm rounded-xl shadow-frost border border-white/20; | ^ 187 | transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 188 | }"
  - generic [ref=e7]: at Input.error (/Users/nullzero/repos-0x0/general-advent/node_modules/postcss/lib/input.js:135:16) at AtRule.error (/Users/nullzero/repos-0x0/general-advent/node_modules/postcss/lib/node.js:146:32) at processApply (/Users/nullzero/repos-0x0/general-advent/node_modules/tailwindcss/lib/lib/expandApplyAtRules.js:380:29) at /Users/nullzero/repos-0x0/general-advent/node_modules/tailwindcss/lib/lib/expandApplyAtRules.js:551:9 at /Users/nullzero/repos-0x0/general-advent/node_modules/tailwindcss/lib/processTailwindFeatures.js:55:50 at async plugins (/Users/nullzero/repos-0x0/general-advent/node_modules/tailwindcss/lib/plugin.js:38:17) at async LazyResult.runAsync (/Users/nullzero/repos-0x0/general-advent/node_modules/postcss/lib/lazy-result.js:293:11) at async runPostCSS (file:///Users/nullzero/repos-0x0/general-advent/node_modules/vite/dist/node/chunks/config.js:30138:19) at async compilePostCSS (file:///Users/nullzero/repos-0x0/general-advent/node_modules/vite/dist/node/chunks/config.js:30122:6) at async compileCSS (file:///Users/nullzero/repos-0x0/general-advent/node_modules/vite/dist/node/chunks/config.js:30052:26) at async TransformPluginContext.handler (file:///Users/nullzero/repos-0x0/general-advent/node_modules/vite/dist/node/chunks/config.js:29585:54) at async EnvironmentPluginContainer.transform (file:///Users/nullzero/repos-0x0/general-advent/node_modules/vite/dist/node/chunks/config.js:28790:14) at async loadAndTransform (file:///Users/nullzero/repos-0x0/general-advent/node_modules/vite/dist/node/chunks/config.js:22660:26) at async viteTransformMiddleware (file:///Users/nullzero/repos-0x0/general-advent/node_modules/vite/dist/node/chunks/config.js:24532:20)
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.ts
    - text: .
```
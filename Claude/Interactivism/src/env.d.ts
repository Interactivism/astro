/// <reference types="astro/client" />

declare module 'virtual:keystatic-config' {
  import type { KeystaticConfig } from '@keystatic/core';
  const config: KeystaticConfig;
  export default config;
}

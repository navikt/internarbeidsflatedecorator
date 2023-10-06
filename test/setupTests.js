import { vi } from 'vitest';
import fetch from 'node-fetch';

globalThis.fetch = fetch;
global.jest = vi;

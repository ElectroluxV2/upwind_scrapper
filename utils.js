import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

export const OPEN_SKIFF_NAME_PATTERN = new RegExp(/o('*)pen\s*(skiff|bic)/i);
export const UPWIND_API_BASE = 'https://www.upwind24.pl';
export const get = async endpoint => await (await fetch(`${endpoint.startsWith('http') ? '' : UPWIND_API_BASE}${endpoint}`)).json();
export const html_to_element = html => new DOMParser().parseFromString(html, 'text/html');
export const extract_text_from_element = element => element.textContent.trim();
export const same_length_array_zip = (a, b) => a.map((k, i) => [k, b[i]]);

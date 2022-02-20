import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import * as stringSimilarity from 'https://deno.land/x/string_similarity/mod.ts'

export const OPEN_SKIFF_NAME_PATTERN = new RegExp(/o('*)pen\s*(skiff|bic)/i);
export const UPWIND_API_BASE = 'https://www.upwind24.pl';
export const get = async endpoint => await (await fetch(`${endpoint.startsWith('http') ? '' : UPWIND_API_BASE}${endpoint}`)).json();
export const html_to_element = html => new DOMParser().parseFromString(html, 'text/html');
export const extract_text_from_element = element => element.textContent.trim();
export const same_length_array_zip = (a, b) => a.map((k, i) => [k, b[i]]);
export const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);
export const string_similarity = (first, second) => stringSimilarity.compareTwoStrings(first, second);
export const to_pg_date = timestamp => { const d = new Date(timestamp); return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}` };
export const polish_date_to_date = date_string => { const p = date_string.split('.'); return new Date(p[2], p[1] - 1, p[0]); };

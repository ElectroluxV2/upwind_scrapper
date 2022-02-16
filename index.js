import { parse_regatta } from './parse_regatta.js';
// import { get, OPEN_SKIFF_NAME_PATTERN } from './utils.js';
//
// const empty_search_results = await get(`/search/regatta.json`);
// const open_skiff_choices = empty_search_results['form']['children']['dinghies']['options']['choices']
//     .filter(choice => OPEN_SKIFF_NAME_PATTERN.test(choice.label))
//     .map(choice => choice.value)
//     .join(',');
//
// const dinghy_param_name = empty_search_results['form']['children']['dinghies']['options']['full_name'];
// const search_base_url = `/search/regatta.json?${dinghy_param_name}=${open_skiff_choices}`;
// const { totalPages: total_pages } = (await get(`${search_base_url}`))['results']['pagination'];
//
// const pending_pages = Array
//     .from({ length: total_pages }, (v, i) => `${search_base_url}&page=${i + 1}`)
//     .map(get);
//
// const pages = await Promise.all(pending_pages);
// const pending_scrapped = pages.map(page => page['results']['items'])
//     .flat()
//     .map(item => item['url'])
//     .map(parse_regatta);
//
// const scrapped = await Promise.all(pending_scrapped);
//
// console.log(scrapped.join());

parse_regatta('/nord-cup-2020').then(scrapped => console.log(scrapped.results));




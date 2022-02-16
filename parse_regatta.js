import { get, OPEN_SKIFF_NAME_PATTERN } from './utils.js';
import { parse_table } from './parse_table.js';

export const parse_regatta = async url => {
    const { regatta } = await get(`${url}.json`);

    const entries_tab = await get(`${url}/entries.json`);
    let pending_entries = entries_tab['tables']
        .filter(item => OPEN_SKIFF_NAME_PATTERN.test(item.name))
        .map(item => item['table']);

    // console.log(pending_entries)
    if (!pending_entries) {
        console.log(url)
        return null;
    }

    pending_entries = pending_entries
        .map(parse_table);

    const entries = await Promise.all(pending_entries);
    // console.log(entries)

    const results_tab = await get(`${url}/results.json`);
    const pending_unparsed_results = results_tab['tables']
        .filter(item => OPEN_SKIFF_NAME_PATTERN.test(item.name))
        .map(table => table['fetchUrl'])
        .map(get);

    const unparsed_results = await Promise.all(pending_unparsed_results);
    const pending_results = unparsed_results
        .map(unparsed => unparsed['tables'])
        .flat()
        .filter(item => OPEN_SKIFF_NAME_PATTERN.test(item.name))
        .map(item => item['table'])
        .map(parse_table);

    const results = (await Promise.all(pending_results)).flat();
    // console.log(results);

    return {
        id: regatta['id'],
        name: regatta['name'],
        entries,
        results
    }

}

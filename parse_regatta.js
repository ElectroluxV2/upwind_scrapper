import { get, OPEN_SKIFF_NAME_PATTERN, same_length_array_zip } from './utils.js';
import { filter_table, parse_table } from './parse_table.js';

export const parse_regatta = async url => {
    const { regatta } = await get(`${url}.json`);

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
        .filter(table => 'head' in table && 'body' in table)
        .map(parse_table);

    const results_array = await Promise.all(pending_results);

    const entries = results_array
        .map(table => filter_table(table, ['sail_number', 'crew', 'dob', 'gender', 'sailing_club']))
        .map(({keys, values}) => ({
            keys: keys.map(({id}) => id),
            values
        }))
        .map(({keys, values}) => values
            .map(row => Object.fromEntries(same_length_array_zip(keys, row))))
        .flat();

    const filtered_results = results_array
        .map(table => filter_table(table, ['sail_number', 'race']))
        .map(({keys, values}) => ({
            keys: keys.map(combine_key),
            values
        }))
        .map(({keys, values}) => values
            .map(row => Object.fromEntries(same_length_array_zip(keys, row)))
        ).flat();

    return {
        id: regatta['id'],
        name: regatta['name'],
        begin_date: regatta['startDate'],
        end_date: regatta['endDate'],
        place: {
            name: regatta['venue']['name'],
            location: `(${regatta['venue']['latitude']}, ${regatta['venue']['longitude']})`
        },
        entries,
        results: filtered_results
    }
}

const combine_key = ({label, id}) => {
    switch (id) {
        case 'race': return label.toLowerCase();
        default: return id;
    }
}


import { extract_text_from_element, html_to_element } from './utils.js';

export const parse_table = async ({head, body}) => {
    const keys = head
        .map(({ id, label }) => ({ id, label }));

    const values = body
        .map(tr => tr
            .map(td => td['data'])
            .map(html_to_element)
            .map(extract_text_from_element)
        );

    return {
        keys,
        values
    };
}

export const filter_table = ({keys, values}, valid_key_ids) => {
    const filtered_keys = keys
        .filter(key => valid_key_ids.includes(key.id));

    const valid_indices = filtered_keys
        .map(key => keys.indexOf(key));

    const filtered_values = values
        .map(row => row.filter((value, index) => valid_indices.includes(index)));

    return {
        keys: filtered_keys,
        values: filtered_values
    };
}
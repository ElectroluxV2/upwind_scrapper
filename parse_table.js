import { extract_text_from_element, html_to_element, same_length_array_zip } from './utils.js';

export const parse_table = async ({head, body}) => {
    const keys = head
        .map(th => th['id'])

    return body
        .map(tr => tr
            .map(td => td['data'])
            .map(html_to_element)
            .map(extract_text_from_element)
        ).map(tr => Object.fromEntries(same_length_array_zip(keys, tr)))
        .flat();
}

import { parse_regatta } from './parse_regatta.js';
import { capitalize, get, OPEN_SKIFF_NAME_PATTERN, string_similarity, to_pg_date } from './utils.js';

const empty_search_results = await get(`/search/regatta.json`);
const open_skiff_choices = empty_search_results['form']['children']['dinghies']['options']['choices']
    .filter(choice => OPEN_SKIFF_NAME_PATTERN.test(choice.label))
    .map(choice => choice.value)
    .join(',');

const dinghy_param_name = empty_search_results['form']['children']['dinghies']['options']['full_name'];
const search_base_url = `/search/regatta.json?${dinghy_param_name}=${open_skiff_choices}`;
const { totalPages: total_pages } = (await get(`${search_base_url}`))['results']['pagination'];

const pending_pages = Array
    .from({ length: total_pages }, (v, i) => `${search_base_url}&page=${i + 1}`)
    .map(get);

const pages = await Promise.all(pending_pages);
const pending_scrapped = pages.map(page => page['results']['items'])
    .flat()
    .map(item => item['url'])
    .map(parse_regatta);

const scrapped = await Promise.all(pending_scrapped);

const dirty_clubs = scrapped
    .map(regatta => regatta['entries'])
    .flat()
    .map(entry => entry['sailing_club'])
    .map(club_name => club_name.toLowerCase())
    .sort();

const distinct_dirty_clubs = new Set(dirty_clubs);

const dirty_sailors = scrapped
    .map(regatta => regatta['entries'])
    .flat()
    .map(({crew, dob, gender}) => ({
        sex: gender,
        birth_year: dob,
        given_name: crew.split(' ')[0],
        family_name: crew.split(' ').slice(1).join(' ')
    }));

const dirty_distinct_sailors = [...new Map(dirty_sailors
    .map(v => [`${v.family_name}${v.given_name}`, v])).values()];

const sailors = dirty_distinct_sailors
    .map(({sex, birth_year, given_name, family_name}) => ({
        sex: sex !== undefined ? sex : (given_name.endsWith('a') ? 'F' : 'M'),
        birth_date: birth_year === undefined ? '1000-01-01' : `${birth_year}-01-01`,
        given_name,
        family_name
    }))
    .map(({sex, birth_date, given_name, family_name}) => ({
        sex: (sex === 'K' ? 'F' : sex),
        birth_date,
        given_name: capitalize(given_name),
        family_name: capitalize(family_name)
    }))
    .sort((a, b) => a.birth_date > b.birth_date ? 1 : -1)
    .map(({sex, birth_date, given_name, family_name}, index) => `(${index + 1}, '${sex}', '${birth_date}', '${given_name}', '${family_name}')`)
    .join(',\n');

const dirty_places = scrapped
    .map(regatta => regatta['place']);

const dirty_distinct_places = [...new Map(dirty_places
    .map(v => [v.name, v])).values()];

const places = dirty_distinct_places
    .map(({name, location}) => ({
        name: name.replace(', Polska', ''),
        location
    }))
    .map(({name, location}, index) => `(${index + 1}, '${location}', '${name}')`)
    .join(',\n');

const filtered_places = ['Gdynia','Gorki Zachodnie','Bitwy pod Płowcami 61, Sopot','Kraków','Puck','Kartuzy','Nieporęt','Złota Góra, Kartuzy County','Sopot','Człuchów','Złota Góra'];

const regattas = scrapped
    .map(({name, begin_date, end_date, place, results}) => ({name, begin_date, end_date, place, results: results[0]}))
    .map(({name, begin_date, end_date, place, results}) => ({
        name,
        begin_date: to_pg_date(begin_date * 1000),
        end_date: to_pg_date(end_date * 1000),
        exclusions: Object.values(results ?? {}).slice(1).join().split('*').length - 1,
        place_id: filtered_places
            .map((v, index) => ({
                name: v,
                similarity: string_similarity(place.name, v),
                id: index + 1
            }))
            .sort((a, b) => a.similarity > b.similarity ? -1 : 1)
            .find((v, index) => index === 0)
            .id
    }))
    .sort((a, b) =>  a.begin_date > b.end_date ? 1 : -1)
    .map(({name, begin_date, end_date, place_id, exclusions}, index) => `(${index + 1}, ${place_id}, ${exclusions}, '${begin_date}', '${end_date}', '${name}')`)
    .join(',\n');

console.log(
    distinct_dirty_clubs,
    sailors,
    places,
    regattas
)

// console.log(`scrapped`, scrapped);

// const urls = pages.map(page => page['results']['items'])
//     .flat()
//     .map(item => item['url']);
//
// for (const url of urls) {
//     console.log(`URL: ${url}`);
//     const scrapped = await parse_regatta(url);
//     console.log('scrapped: ', scrapped);
// }

// console.log(await get('https://www.upwind24.pl/regatta/mistrzostwa-pomorza-w-klasie-open-skiff-2021-2021/results.json'))
//
// parse_regatta('/regatta/mistrzostwa-pomorza-w-klasie-open-skiff-2021-2021').then(scrapped => console.log('scrapped: ', scrapped));
//


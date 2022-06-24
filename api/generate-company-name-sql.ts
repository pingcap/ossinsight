import * as fs from 'fs'
import YAML from 'yaml';

const file = fs.readFileSync('company-names.yaml', 'utf8');
const data = YAML.parse(file);

interface Company {
    unique_name: string;
    alias_names: string[];
}

const company_name_prefixes = [
    '@',
    'www.'
];
const company_name_suffixes = [
    'inc.',
    'co.',
    ' inc',
    ',inc',
    '!',
    ',',
    '-',
    '.',
    'com',
    'ltd',
    'pvt',
    'corporation'
];

let result = (data?.company_names || []).map((item: Company) => {
    return `
update users set company_name = '${item.unique_name}' 
where trim(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(lower(company), '!', ''), ',', ''), '-', ''), '@', ''), '.', ''), 'ltd', ''), 'inc.', ''), 'com', ''), 'www', ''), 'corporation', '')) 
in (${item.alias_names.map((alias_name: string) => {
    return `'${alias_name}'`
}).join(', ')}));
`}).join('\n');


result += `
update users set company_name = 'student'
where trim(lower(company)) in ('school', 'student');
`;

const independent_company_names = [
    'home',
    'freelancer',
    'freelance', 'self',
    'personal',
    'none',
    'no',
    'private',
    'selfemployed',
    'self employed',
    'free',
    'independent',
    'myself',
    '无',
    'me'
]

result += `
update users set company_name = 'freelancer'
where trim(lower(company)) in (${independent_company_names.map((company_name) => `'${company_name}'`).join(', ')});
`;

const invalid_company_names = [
    '-',
    '--- click here ---',
    '^^^^^^^^^^^^^^^click link above to enter^^^^^^^^^^^^^^',
    '^^^^^^^^^^^^^^click link above to enter^^^^^^^^^^^^^^',
    'n/a',
    'unknown',
    'null',
    'china',
    'japan',
    'taiwan',
    '中国',
    'earth',
    '1',
    '40',
    '1995',
    '1996',
    '1997',
    '1998'
];

result += `
update users set company_name = null
where trim(lower(company)) in (${invalid_company_names.map((company_name) => `'${company_name}'`).join(', ')});
`;

fs.writeFileSync('unique-company-names.sql', result)



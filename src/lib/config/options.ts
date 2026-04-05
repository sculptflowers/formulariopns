export interface UnidadeOption {
    label: string;
    value: string;
}

export interface UnidadeRuralMatriz {
    label: string;
    value: string;
    satelites: UnidadeOption[];
}

// Unidades rurais com suas respectivas satélites
export const unidadesRuraisMatriz: UnidadeRuralMatriz[] = [
    {
        label: 'USF SANTA MADALENA',
        value: '3043673',
        satelites: [
            { label: 'UBS CASACA DE FERRO', value: '7510462' },
            { label: 'POSTO DE SAUDE DO CUNHA', value: '7510454' }
        ]
    },
    {
        label: 'USF ALTO DO MORRO',
        value: '2514699',
        satelites: [
            { label: 'POSTO DE SAUDE CAMACARI', value: '7453345' },
            { label: 'POSTO DE SAUDE CRUZEIRO DO RIACHAO', value: '7453337' },
            { label: 'POSTO DE SAUDE RIACHO DANTAS', value: '7453353' },
            { label: 'POSTO DE SAUDE SAO BARTOLOMEU', value: '7453329' }
        ]
    },
    {
        label: 'USF ESPERANCA BENFICA',
        value: '2514672',
        satelites: [
            { label: 'POSTO DE SAUDE ESPINHEIRO', value: '7464347' },
            { label: 'POSTO DE SAUDE RICARDO FRANCISCO DA SILVA CRUZEIRO RIACHAO', value: '9903445' },
            { label: 'POSTO DE SAUDE VILA BOMFIM', value: '7453361' }
        ]
    },
    {
        label: 'USF BOA VISTA',
        value: '2519666',
        satelites: [
            { label: 'POSTO DE SAUDE BOMFIM', value: '7453310' },
            { label: 'POSTO DE SAUDE SAPUCAIA', value: '7453299' }
        ]
    },
    {
        label: 'UBS COCAO',
        value: '2514664',
        satelites: [
            { label: 'POSTO DE SAUDE FATIMA', value: '7453272' },
            { label: 'POSTO DE SAUDE MINA DO SAPE', value: '7453280' }
        ]
    }
];

// Mapa para acesso rápido por value
export const unidadesRuraisMap = new Map(
    unidadesRuraisMatriz.map(u => [u.value, u])
);

// IDs das unidades rurais matriz (para verificar isRural)
export const idsUnidadesRurais = new Set(unidadesRuraisMatriz.map(u => u.value));

// Lista completa de UBS/USF para o select (apenas matrizes, sem satélites avulsas)
export const optionsUbs: UnidadeOption[] = [
    { label: 'UBS CIDADE NOVA II', value: '9645349' },
    { label: 'UBS ZILDA ARNS I E II', value: '7683774' },
    { label: 'USF ALTO SANTO ANTONIO I E II', value: '2519690' },
    { label: 'USF ALTO SOBRADINHO I E II', value: '3924564' },
    { label: 'USF AURELINO PEREIRA DOS REIS', value: '3727904' },
    { label: 'USF BELA VISTA', value: '5388732' },
    { label: 'USF DO AMPARO', value: '3553183' },
    { label: 'USF IRMA DULCE', value: '2519631' },
    { label: 'USF DO CALABAR URBIS I A E B', value: '3558282' },
    { label: 'USF DR FERNANDO QUEIROZ I', value: '3654605' },
    { label: 'USF DR FERNANDO QUEIROZ II', value: '3654613' },
    { label: 'USF GERALDO PESSOA SALLES I E II', value: '3521877' },
    { label: 'USF MARITA AMANCIO', value: '3924513' },
    { label: 'USF SAO FRANCISCO I E II', value: '2520095' },
    { label: 'USF SAO PAULO I', value: '2520087' },
    { label: 'USF SAO PAULO II', value: '7432186' },
    { label: 'USF URBIS II A E B', value: '3043916' },
    { label: 'USF URBIS III A E B', value: '2519682' },
    { label: 'USF VEREADOR DURVAL SAMUEL DE SOUZA I II E III', value: '2520109' },
    { label: 'USF VIRIATO LOBO I E II', value: '3750663' },
    // Rurais (matrizes)
    { label: 'USF SANTA MADALENA (RURAL)', value: '3043673' },
    { label: 'USF ALTO DO MORRO (RURAL)', value: '2514699' },
    { label: 'USF ESPERANCA BENFICA (RURAL)', value: '2514672' },
    { label: 'USF BOA VISTA (RURAL)', value: '2519666' },
    { label: 'UBS COCAO (RURAL)', value: '2514664' }
];

export const optionsHospitais: UnidadeOption[] = [
    { label: 'HOSPITAL DO RECONCAVO - HSA', value: '3034445' },
    { label: 'HOSPITAL INCAR', value: '3042413' },
    { label: 'HOSPITAL MATERNIDADE LUIZ ARGOLO', value: '2799286' },
    { label: 'HOSPITAL REGIONAL DE SANTO ANTONIO DE JESUS', value: '6414702' },
    { label: 'UPA', value: '156132' },
    { label: 'UNIMED', value: '5306922' }
];

export const optionsLab: UnidadeOption[] = [
    { label: 'LAB FERNANDO QUEIROZ', value: '2520303' },
    { label: 'LAB SABIN', value: '9183671' },
    { label: 'LABOCLIV', value: '6345832' },
    { label: 'LAB INCAR', value: '3042413' }
];
const wordsRegexp = /(pula|pizda|muie|cacat|negru|pidr|nigrila|niga|niger|pidaras|pidoras|pidor|niggrila|pedik|nigga|negar|neggar|piderast|majestic|grand|madjestic|grand|redage|arizon|arizona|pidr|pidor|nigger|nigga|niger|pidaras|pidrila|pedik|pidoras|negr|majestik|arizon|radmir|daun|vrp|onix|onixrp|parvenu|parvenurp|{|}|<|>)/gi;

export function prepareValue(value: string) {
	return value.replace(wordsRegexp, (res) => (res ? '*'.repeat(res.length) : ''));
}

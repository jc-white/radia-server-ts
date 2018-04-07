import * as _ from 'lodash';

function onlyInts(input: any) {
	if (input === null || _.isUndefined(input)) return;
	if (!_.isString(input) && !_.isNumber(input) && !_.isInteger(input)) return;

	return _.isNumber(input) ? input : parseInt(input.toString().replace(/[^0-9]/g, ''));
}

function alpha(input: any) {
	if (input === null || _.isUndefined(input)) return;

	return input.toString().replace(/[^a-zA-Z]/g, '');
}

function alphaSpace(input: any) {
	if (input === null || _.isUndefined(input)) return;

	if (_.isInteger(input)) input = input.toString();

	return input.toString().replace(/[^a-zA-Z ]/g, '');
}

function alphaNumeric(input: any) {
	if (input === null || _.isUndefined(input)) return;

	if (_.isInteger(input)) input = input.toString();

	return input.toString().replace(/[^a-zA-Z0-9]/g, '');
}

function alphaNumSpace(input: any) {
	if (input === null || _.isUndefined(input)) return;

	if (_.isInteger(input)) input = input.toString();

	return input.toString().replace(/[^a-zA-Z0-9 ]/g, '');
}

function alphaNumDash(input: any) {
	if (input === null || _.isUndefined(input)) return;

	if (_.isInteger(input)) input = input.toString();

	return input.replace(/[^a-zA-Z0-9-_]/g, '');
}

function alphaNumSpaceDash(input: any) {
	if (input === null || _.isUndefined(input)) return;

	if (_.isInteger(input)) input = input.toString();

	return input.toString().replace(/[^a-zA-Z0-9-_ ]/g, '');
}

function alphaNumSymbol(input: any) {
	if (input === null || _.isUndefined(input)) return;

	if (_.isInteger(input)) input = input.toString();

	return input.replace(/[^a-zA-Z0-9!@#$%^&*()-_=+ ]/g, '');
}

function escapedString(input: string) {
	if (input === null || _.isUndefined(input)) return;

	if (_.isInteger(input)) input = input.toString();

	return _.trim(_.escape(input));
}

function boolean(input: any) {
	if (input === true || input === 1 || input === '1' || input === 'true') return 1;

	return 0;
}

function sortDirection(input: string) {
	//'true' and 'false' here are for compatibility with Clarity's datagrid which uses true/false rather than asc/desc

	if (_.isEmpty(input) || !_.isString(input) || input == 'true') return 'asc';
	if (input == 'false') return 'desc';

	input = input.toLowerCase();

	if (!_.includes(['asc', 'desc'], input)) return 'asc';

	return input;
}

function restrictStringToArray(input: string, array: Array<string>, defaultValue: string = null) {
	if (_.isInteger(input)) input = input.toString();

	if (_.isEmpty(input) || !_.isString(input)) return defaultValue;

	let inputLower = input.toLowerCase(),
	    arrayLower = _.map(array, _.toLower);

	if (!_.includes(arrayLower, inputLower)) return defaultValue;

	return input;
}

function date(input: string) {
	if (_.isNaN(new Date(input).getTime())) return null;

	return input;
}

/**
 * Removes all symbols from the input string
 * @param input The string to sanitize
 * @param strict If true, also remove these symbols: @ , . -
 * @returns {*}
 */
function removeSymbols(input: string, strict: boolean = false) {
	if (!_.isString(input)) return input;

	if (!strict) return input.replace(/[;\_\[\]\(\)!#\$%\^&\*=\+~:<>\?\/\\]/g, '');

	return input.replace(/[;\-_\[\]\(\)!#@\$%\^&\*=\+~:<>\?\/\\\.]/g, '');
}

function numericComparisonOperator(input: string) {
	const validOperators = ['<', '<=', '=', '>=', '>'];

	if (!_.includes(validOperators, input)) return '=';

	return input;
}

export const Sanitizers = {
	integer:                   onlyInts,
	alpha:                     alpha,
	alphaSpace:                alphaSpace,
	alphaNumeric:              alphaNumeric,
	alphaNumDash:              alphaNumDash,
	alphaNumSpace:             alphaNumSpace,
	alphaNumSpaceDash:         alphaNumSpaceDash,
	alphaNumSymbol:            alphaNumSymbol,
	escapedString:             escapedString,
	boolean:                   boolean,
	sortDirection:             sortDirection,
	enumString:                restrictStringToArray,
	removeSymbols:             removeSymbols,
	date:                      date,
	numericComparisonOperator: numericComparisonOperator,

	netID:   alphaNumeric,
	UIN:     onlyInts,
	edwID:   onlyInts,
	appID:   alphaNumeric,
	orgCode: onlyInts,
	roomID:  alphaNumDash
};
import {Dictionary} from 'lodash';
import * as moment from 'moment';
import * as _ from 'lodash';

export const Utils = {
	isValidDate: function (string, format) {
		if (_.isEmpty(string)) return false;

		return moment(string, format).isValid();
	},

	isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	isValidStringOrInteger: function (input: any) {
		if (_.isInteger(input)) return true;
		if (_.isEmpty(input)) return false;
		if (_.isNull(input)) return false;
		if (_.isString(input)) return true;

		return false;
	},

	convertBoolsToBinary(obj: {}) {
		const newObj = _.cloneDeep(obj);

		Object.keys(newObj).forEach(field => {
			if (typeof newObj[field] == "boolean") {
				newObj[field] = !!newObj[field] ? 1 : 0;
			}
		});

		return newObj;
	},

	getMatches(str, regex) {
		let matches = [];
		let match;

		if (regex.global) {
			regex.lastIndex = 0;
		} else {
			regex = new RegExp(regex.source, 'g' +
				(regex.ignoreCase ? 'i' : '') +
				(regex.multiline ? 'm' : '') +
				(regex.sticky ? 'y' : ''));
		}

		while (match = regex.exec(str)) {
			matches.push(match);

			if (regex.lastIndex === match.index) {
				regex.lastIndex++;
			}
		}

		return matches;
	},

	ucFirst(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
};
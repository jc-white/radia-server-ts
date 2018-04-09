import {EGender} from '../common/interfaces/hero/hero-misc.enum';

export interface IChargenFormData {
	name?: string;
	gender?: EGender;
	classID?: number;
	backstoryID?: string;
	traitIDs?: Array<string>;
}
import {EGender} from '../../models/hero/hero-misc.enum';

export interface IChargenFormData {
	name?: string;
	gender?: EGender;
	classID?: number;
	backstoryID?: string;
	traitIDs?: Array<string>;
}
import {Body, Controller, Get, Post, Put, Req, Res} from '@nestjs/common';
import {ChargenService} from './chargen.service';
import {IChargenFormData} from '../../../shared/interfaces/chargen/chargen.interface';
import {HeroService} from '../common/services/hero.service';
import {TraitsDictionary} from '../../../shared/dicts/traits.dict';
import * as _ from 'lodash';
import {isNumeric} from '../../../shared/functions/utils';

@Controller('chargen')
export class ChargenController {
	constructor(private chargenService: ChargenService, private heroService: HeroService) {

	}

	@Get('/backstory')
	async getBackstories(@Req() req, @Res() res) {
		let backStories = await this.chargenService.getBackstories();

		res.json(backStories);
	}

	@Post('/submit')
	async submitChargen(@Req() req, @Res() res, @Body('formData') formData: IChargenFormData) {
		function fail(message: string) {
			res.json({
				success: false,
				message: message
			});

			return;
		}

		const numTraits   = formData.traitIDs.length,
		      traitIDs    = _.uniq(formData.traitIDs),
		      backstoryID = formData.backstoryID;

		const traitsToApply: Array<string>                = [];
		const skillsToApply: { [string: string]: number } = {};

		if (_.isEmpty(formData.name)) {
			return fail('A hero name is required.');
		}

		if (!isNumeric(formData.gender) || ([1,2].indexOf(formData.gender) == -1)) {
			return fail('Invalid gender selected.');
		}

		if (!backstoryID) {
			return fail('Invalid backstory selected.');
		} else {
			const backstory = await this.chargenService.getBackstoryByID(backstoryID);

			if (_.isEmpty(backstory)) {
				return fail('Invalid backstory selected.');
			} else {
				console.log('Backstory valid');

				backstory.traits.forEach(trait => traitsToApply.push(trait));
			}
		}

		if (traitIDs.length !== 2) {
			return fail('Invalid trait(s) selected.');
		} else {
			if (_.intersection(traitsToApply, traitIDs).length) {
				return fail('You cannot select a trait included in your backstory.');
			}

			let traitsInDict = TraitsDictionary.filter(trait => traitIDs.indexOf(trait.traitID) > -1);

			const allTraitsValid = traitIDs.every(traitID => !!_.find(traitsInDict, {
				traitID: traitID
			}));

			if (!allTraitsValid) {
				return fail('One or more selected traits is invalid.');
			}
		}

		res.json({
			success: true
		});
	}
}
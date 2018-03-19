import {Body, Controller, Get, Post, Put, Req, Res} from '@nestjs/common';
import {BackstoriesDict} from '../dicts/backstories.dict';
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
	getBackstories(@Req() req, @Res() res) {
		res.json(BackstoriesDict);
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

		const traitIDs    = _.uniq(formData.traitIDs),
		      backstoryID = formData.backstoryID,
		      backstory   = BackstoriesDict[backstoryID];

		if (_.isEmpty(formData.name)) {
			return fail('A hero name is required.');
		}

		if (!isNumeric(formData.gender) || ([1, 2].indexOf(formData.gender) == -1)) {
			return fail('Invalid gender selected.');
		}

		if (!backstoryID) {
			return fail('Invalid backstory selected.');
		} else {
			if (_.isEmpty(backstory)) {
				return fail('Invalid backstory selected.');
			} else {
				console.log('Backstory valid');
			}
		}

		if (traitIDs.length !== 2) {
			return fail('Invalid trait(s) selected.');
		} else {
			if (_.intersection(backstory.traits, traitIDs).length) {
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

		const newHero = await this.chargenService.createHero(req.session.passport.user, formData);

		if (newHero._id) {
			res.json({
				success: true
			});
		} else {
			res.json({
				success: false
			});
		}
	}
}
import {Schema, SchemaTypes} from 'mongoose';

export const StatsSchema = new Schema({
	str: Number,
	int: Number,
	dex: Number,
	con: Number,
	luk: Number
});

export const VitalitySchema = new Schema({
	health:  [Number, Number],
	stamina: [Number, Number],
	mana:    [Number, Number]
});

export const HeroSchema = new Schema({
	heroID:      {
		type: String
	},
	name:        String,
	gender:      Number,
	backstoryID: String,
	traits:      [String],
	stats:       StatsSchema,
	skills:      SchemaTypes.Mixed,
	vitality:    VitalitySchema
}, {
	collection: 'heroes'
});

Object.assign(HeroSchema.methods, {
	getName: function() {
		return this.name;
	}
});


const mongoose = require('mongoose');
require('./Counter');

const MarksEntrySchema = new mongoose.Schema({
	numericId: { type: Number },
	student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
	subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
	paperName: { type: String, required: true },
	paperCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
	grade: { type: String, required: true },
	mark: { type: Number, required: true },
	maxMark: { type: Number, required: true },
	date: { type: Date, required: true },
	// Optionally, you can add a unique constraint for (student, subject, paperName, date) if needed
}, { timestamps: true });

MarksEntrySchema.pre('save', async function() {
	if (!this.isNew) return;

	try {
		const Counter = mongoose.model('Counter');
		const currentCount = await mongoose.model('MarksEntry').countDocuments();

		if (currentCount === 0) {
			await Counter.findOneAndUpdate(
				{ id: 'mark_id' },
				{ seq: 0 },
				{ upsert: true }
			);
		}

		const counter = await Counter.findOneAndUpdate(
			{ id: 'mark_id' },
			{ $inc: { seq: 1 } },
			{ returnDocument: 'after', upsert: true }
		);

		this.numericId = counter.seq;
	} catch (error) {
		throw error;
	}
});

MarksEntrySchema.index({ student: 1, paperName: 1 }, { unique: true });

module.exports = mongoose.model('MarksEntry', MarksEntrySchema);

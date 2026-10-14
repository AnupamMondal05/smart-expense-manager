import { Schema, model } from 'mongoose';

const individualShareSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    shares: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const expenseSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 1, maxlength: 200 },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be greater than 0'] },
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Education', 'Shopping', 'Medical', 'Other'],
      default: 'Other',
    },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    splitType: {
      type: String,
      required: true,
      enum: ['equal', 'custom', 'percentage', 'shares'],
      default: 'equal',
    },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    individualShares: [individualShareSchema],
    notes: { type: String, default: '', trim: true, maxlength: 1000 },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ group: 1, date: -1 });

export default model('Expense', expenseSchema);

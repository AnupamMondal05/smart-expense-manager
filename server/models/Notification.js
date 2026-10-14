import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['group_member_added', 'expense_added', 'expense_involvement', 'settlement_created', 'settlement_paid'],
      required: true,
    },
    relatedGroup: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
    relatedExpense: { type: Schema.Types.ObjectId, ref: 'Expense', default: null },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default model('Notification', notificationSchema);

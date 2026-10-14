import { Schema, model } from 'mongoose';

const settlementSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: { type: String, enum: ['pending', 'settled', 'cancelled'], default: 'pending' },
    settledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model('Settlement', settlementSchema);

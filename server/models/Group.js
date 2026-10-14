import { Schema, model } from 'mongoose';

const groupSchema = new Schema(
  {
    name: { type: String, required: [true, 'Group name is required'], trim: true, minlength: 1, maxlength: 100 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default model('Group', groupSchema);

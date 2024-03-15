import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true, minlength: 6 },
    id: { type: String },
    post: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
},{
    timestamps: true,
});
export default mongoose.model('User', userSchema);
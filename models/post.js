import mongoose from "mongoose";
const postSchema = mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Comment'
        }
    ],
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Like'
        }
    ]
},{
    timestamps: true,
});
export default mongoose.model('Post', postSchema);
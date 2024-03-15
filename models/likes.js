import mongoose from "mongoose";
const likeschema = mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId
    },
    likeable:{
        type:mongoose.Schema.ObjectId,
        required:true,
        refPath:'onModel'
    },
    onModel:{
        type:String,
        required:true,
        enum:['Post','Comment']
    }
},{
    timestamps:true
});
export default mongoose.model('Like',likeschema);
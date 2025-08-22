import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// User Schema
const userSchema = new Schema({
    username: { type: String, required: true, trim: true }, 
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}); 

// Content Schema
const contentSchema = new Schema({
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true },
    link: { type: String, required: true, trim: true },
    tags: {type: [String], default: []},
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const LinkSchema =new Schema({
    hash:String,
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
})

// Create models
export const User = model("User", userSchema);
export const Content = model("Content", contentSchema);
export const Link = model("Links",LinkSchema)

 
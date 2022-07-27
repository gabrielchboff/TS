import mongoose from "mongoose";

const user = new mongoose.Schema({
   
    email:{
        type: String,
        unique:true,
    },
    phoneNumber: String,
    address:String,
    password: String,
    isAdmin: {
        type: Boolean,
        default: false,

    }

});

export default mongoose.model('User', user);


import mongoose, { Error, Schema } from "mongoose";
import express, { Response, Request } from "express";
import cors from "cors";
import passport from "passport";
import passportlocal from "passport-local";
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from './Models/User';
import { UserInterface } from "./Interfaces/UserInterface";

const LocalStrategy = passportlocal.Strategy;
const app = express();

mongoose.connect('mongodb+srv://root:T3st34b1surd0@omnistack9.ebge1.mongodb.net/?retryWrites=true&w=majority', {},(err:Error)=> {
    if (err) throw err;
    console.log("[#] Database conected!");
});

//Middleware

app.use(express.json());
app.use(cors({origin:'localhost:3000', credentials:true}));
app.use(
    session({
        secret:'secretcode',
        resave:true,
        saveUninitialized: true,
    })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//passport
passport.use(new LocalStrategy((email, password, done)=> {
    User.findOne({email: email}, (err: Error, user: any) => {
        if (err) throw err;
        if(!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
            if(err) throw err;
            if (result === true) {
                done(null, user) 
            } else {
                done(null, false);
            }
        });
    });

}));

passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id:string, cb) => {
    User.findOne({_id:id}, (err: Error, user:any) => {
        const userInformation = {
            email: user.email,
            isAdmin:user.isAdmin,
        };
        cb(err, userInformation);
    });
})

// Routes

app.get('/successRegister', () => {

}) ;

app.post('/login', passport.authenticate('local'), (req: Request, res:Response) => {
    res.redirect('/dashboard');
});

app.post('/register', async (req: Request, res: Response) => {

    const { email, password, address, phoneNumber } = req?.body;
    if (!email || !password || !address || !phoneNumber ||
            typeof email !== "string" || typeof password !== "string" ||
            typeof address !== "string" || typeof phoneNumber !== "string") 
    {
        return;
    }

    User.findOne({email}, async (err:Error, doc:UserInterface) => {
        if (err) throw err;
        if (doc) res.redirect('/login');
        if (!doc) {
        
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const hashedAdress = await bcrypt.hash(req.body.address, 13);
            const hashedPhoneNumber = await bcrypt.hash(req.body.phoneNumber, 10);
            const newUser = new User({
                email:req.body.email,
                password:hashedPassword,
                address: hashedAdress,
                phoneNumber: hashedPhoneNumber,

            });
            await newUser.save()
            res.redirect('/successRegister');
        }
    });

});



app.listen(3000, ()=>{
    console.log("started")
});
import User from '../Models/UserModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const signup = async (req,res,next) => {
    try {
        console.log('in useReg');
        const { name, email, password, mobile } = req.body;
        const exists = await User.findOne({email:email})
        if (exists) {
            console.log("email already exists");
          return res.status(200).json({ message: "Email already Exists", status: false });
        }else{
            const hash = await bcrypt.hash(password,10)
            const newuser = await User.create({name:name,email:email,password:hash,mobile:mobile,is_admin:false})
            const token = jwt.sign({userId:newuser._id},process.env.JWTKEY,{expiresIn: '1min'});
            return res.status(200).json({token:token,user:newuser,alert:'Registerd',status:true})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const login = async (req,res,next)=>{
    console.log("objectsss"+data);
    console.log('hey im doneeee');
}

export default{
    login,
    signup
}
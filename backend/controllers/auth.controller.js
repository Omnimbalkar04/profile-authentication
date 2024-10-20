import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import crypto from "crypto"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";


export const Signup = async (req, res) => {
  const { email, password, name } = req.body;
 try {
   if (!email || !password || !name) {
    throw new Error("All Fields are required");
   }

   const userAlreadyExist = await User.findOne({email});
   if (userAlreadyExist) {
    return res.status(400).json({success:false, message:"User already exists"});
   }

   const hashedPassword = await bcryptjs.hash(password, 10);
   const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
   const user = new User({
    email,
    password: hashedPassword,
    name,
    verificationToken,
    verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000 //24hrs
   })

   await user.save();

   //jwt token
   generateTokenAndSetCookie(res,user._id);

   await sendVerificationEmail(user.email, verificationToken);

   return res.status(201).json({success:true, message: "User created", user: {
    ...user._doc,
    password: undefined
   }});

 } catch (error) {
  return res.status(400).json({success:false, message: error.message});
 }
}

export const verifyEmail = async (req, res) => {
  const {code} = req.body;
  try {
    const user = await User.findOne( {
      verificationToken: code,
      verificationTokenExpireAt: { $gt: Date.now() }
    })

    if(!user){
      return res.status(400).json({success:false, message:"Invalid or Expired verification code"})
    }

    user.iaVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpireAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({success:true, message: "Email verified Succesfully", user: {
      ...user._doc,
      password: undefined
     }});
  
  } catch (error) {
    res.status(500).json({ success:false, message: "server Error"});
  }
}

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if(!user) {
     return res.status(400).json({success: false, message: "Invalid Credentials"});
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    
    if(!isPasswordValid) {
     return res.status(400).json({success: false, message: "Invalid Credentials"});
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({success:true, message: "Logged in Succesfully", user: {
      ...user._doc,
      password: undefined
     }});
  } catch (error) {
    console.log("Error in login", error)
    res.status(400).json({ success:false, message: error.message});
  }
}

export const Logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success:true, message:"Logout Successfully"});
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
     return res.status(400).json({success: false, message: "User not found"});
    }

    //Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpireAt = resetTokenExpiresAt;

    await user.save();

    //Send Email
    await sendPasswordResetEmail(user.email , `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({success: true, message: "Password reset link send to your email"});

  } catch (error) {
    console.log("Error in forgotPassword", error)
    res.status(400).json({ success:false, message: error.message});
  }
}

export const resetPassword = async (req, res) => {
  try {
    const {token} = req.params;
    const {password} = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpireAt: { $gt: Date.now() },
    })

    if (!user) {
     return  res.status(400).json({success: false, message: "Invalid or expired reset token"});
    }

    //Update Password 
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpireAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);
    res.status(200).json({success: true, message: "Password reset Successful"});

  } catch (error) {
    console.log("Error in resetPassword", error)
    res.status(400).json({ success:false, message: error.message});
  }
}


export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if(!user) {
     return res.status(400).json({success: false, message: "User not found"});
    }

    res.status(200).json({success:true, user})
  } catch (error) {
    console.log("Error in checkAuth", error)
    res.status(400).json({ success:false, message: error.message});
  }
}
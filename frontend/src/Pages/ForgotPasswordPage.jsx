import {motion} from "framer-motion"
import { useState } from "react"
import { useAuthStore } from "../store/authStore";
import { Box, Typography } from "@mui/material";
import Input from "../Components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState();

  const {isLoading, forgotPassword} = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);

  }

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden "
    >
      <Box
      className="p-8"
      >
      <Typography className="!text-3xl !font-bold !mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Forgot Password
        </Typography>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-300 mb-6 text-center" >
              Enter your email address and we'll send you link to reset your password
            </p>

            <Input 
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />

<motion.button
            className=" w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
           
          >
            {isLoading ? <Loader className="size-6 animate-spin mx-auto"  /> : "Send Reset Link"}
          </motion.button>

          </form>
        ) : (
          <Box className="text-center">
          <motion.div
    initial={{ scale: 0}}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30}}
      className=" w-16 h-16 bg-green-500 flex items-center justify-center bg-opacity-50 mx-auto rounded-full mb-4 "
    >
      <Mail className="h-8 w-8 text-white" />

    </motion.div>
    <p className="text-gray-300 mb-6" >
      If an account exists for {email}, you will recive a password reset link shortly.
    </p>
    </Box>
    
        )}
      </Box>

      <Box
      className="px-8 bg-gray-900 bg-opacity-50 flex justify-center"
      >
        <Link to={"/login"} className="text-sm text-green-400 hover:underline flex items-center" >
        <ArrowLeft className="h-4 mr-2 w-4" /> Back to Login
        </Link>        
      </Box>
    </motion.div>
  )
}

export default ForgotPasswordPage
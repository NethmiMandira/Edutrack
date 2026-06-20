import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineEye, 
  HiOutlineEyeOff, 
  HiOutlineShieldCheck, 
  HiSparkles 
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const TUTOR_UID = "b8B7cTSZUUMvIfVWzA4HFz0yAJJ3";

export default function TutorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.uid === TUTOR_UID) {
        navigate("/dashboard");
      } else {
        await signOut(auth);
        setError("Access denied. Authorized personnel only.");
      }
    } catch (err) {
      setError("The credentials provided are incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.2, 0.3] 
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[10%] -right-[10%] w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[600px] lg:h-[600px] bg-indigo-600/20 rounded-full blur-[90px] sm:blur-[110px] lg:blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
            opacity: [0.2, 0.1, 0.2] 
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-[20%] -left-[10%] w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] lg:w-[800px] lg:h-[800px] bg-slate-800 rounded-full blur-[100px] sm:blur-[120px] lg:blur-[140px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px] sm:max-w-[460px]"
      >
        {/* Glassmorphic Container */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-10 shadow-[0_32px_120px_-15px_rgba(0,0,0,0.5)]">
          
          {/* Top Brand Section */}
          <div className="flex flex-col items-center mb-8 sm:mb-10 lg:mb-12">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-white text-3xl sm:text-4xl shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-5 sm:mb-6"
            >
              <HiOutlineShieldCheck />
            </motion.div>
            
            {/* Added Title Here */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">
              Tutor Login
            </h2>
            
          </div>

          {/* Error Notification */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                  className="mb-5 sm:mb-6 overflow-hidden"
              >
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] sm:text-xs font-bold p-3 sm:p-3.5 rounded-2xl text-center">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            {/* Input Groups */}
              <div className="space-y-3.5 sm:space-y-4">
              <div className="relative group">
                <div className="pointer-events-none absolute inset-0 bg-indigo-500/0 group-focus-within:bg-indigo-500/5 rounded-2xl transition-all duration-300" />
                  <HiOutlineMail className="pointer-events-none absolute left-4 top-3.5 sm:top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={22} />
                <input
                  type="email"
                  placeholder="Administrator Email"
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/5 text-white placeholder-slate-600 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className="pointer-events-none absolute inset-0 bg-indigo-500/0 group-focus-within:bg-indigo-500/5 rounded-2xl transition-all duration-300" />
                  <HiOutlineLockClosed className="pointer-events-none absolute left-4 top-3.5 sm:top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={22} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                    className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white/5 border border-white/5 text-white placeholder-slate-600 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                    className="absolute right-4 top-3.5 sm:top-4 text-slate-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiOutlineEyeOff size={22} /> : <HiOutlineEye size={22} />}
                </button>
              </div>
            </div>

            {/* Premium Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden py-3.5 sm:py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : "Unlock Dashboard"}
              </span>
            </motion.button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-6 sm:mt-8 flex justify-center border-t border-white/5 pt-5 sm:pt-6">

          </div>
        </div>
      </motion.div>
    </div>
  );
}
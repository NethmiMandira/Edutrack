import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineArrowRight, HiOutlineEye, HiOutlineEyeOff, HiOutlineExclamation } from "react-icons/hi";

/**
 * specialized link component for clarity on dark backgrounds.
 * Uses lighter slate and indigo glow for premium visibility.
 */
export const AuthLink = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative group px-1 text-slate-200 hover:text-white transition-all duration-300 font-bold text-[13px] tracking-wide"
  >
    <span>{children}</span>
    {/* Animated Underline Glow */}
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_12px_rgba(129,140,248,0.9)]" />
  </button>
);

const StudentAuthCard = ({
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel,
  footer,
  error = null,
  isLoading = false 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.15, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.1, 0.15] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-[140px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* Main Glassmorphic Container */}
        <div className="grid w-full overflow-hidden rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_120px_-15px_rgba(0,0,0,0.5)] md:grid-cols-2">
          
          {/* Left Panel: Branding & Policy */}
          <div className="relative overflow-hidden bg-slate-900/40 p-10 md:p-14 flex flex-col justify-center border-r border-white/5">
            <div className="mb-10">
              <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                {title}
              </h1>
              <p className="mt-6 text-slate-400 text-base font-medium leading-relaxed max-w-sm">
                {subtitle}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md max-w-sm">
              <div className="flex items-center gap-3 text-indigo-400 mb-3">
                <HiOutlineShieldCheck size={24} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Security Protocol</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Please use your <span className="text-white font-bold">Index Number</span> to authenticate. Access is strictly granted to pre-registered students.
              </p>
            </div>
          </div>

          {/* Right Panel: Form Fields */}
          <div className="p-10 md:p-14 bg-white/[0.01] flex flex-col justify-between">
            <form onSubmit={onSubmit} className="space-y-7">
              <div className="space-y-6">
                {children}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-5 rounded-[2rem] border-2 border-rose-500/30 bg-rose-500/10"
                >
                  <div className="text-2xl text-rose-400">
                    <HiOutlineExclamation />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-[0.1em] font-black text-rose-400 mb-1">Error</div>
                    <div className="text-rose-300 font-medium text-sm">{error}</div>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden py-4.5 bg-indigo-600 text-white font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-3 tracking-wide uppercase text-xs">
                  {isLoading ? "Authenticating..." : (
                    <>
                      {submitLabel}
                      <HiOutlineArrowRight size={18} />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Clearer Footer with Light Contrast Links */}
            {footer && (
              <div className="mt-10 text-center pt-8 border-t border-white/5">
                <div className="flex items-center justify-center gap-4">
                  {footer}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const AuthInput = ({ label, type = 'text', value, onChange, placeholder, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2.5">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="pointer-events-none absolute inset-0 bg-indigo-500/0 group-focus-within:bg-indigo-500/5 rounded-2xl transition-all duration-300" />
        <input
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-5 ${isPassword ? 'pr-12' : 'pr-5'} py-4 bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-semibold text-sm disabled:cursor-not-allowed`}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={disabled}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentAuthCard;
"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ShieldCheck, MapPin } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [step, setStep] = useState<'options' | 'phone' | 'otp' | 'success'>('options');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      
      // After success, wait a bit then trigger login
      setTimeout(() => {
        onLoginSuccess();
        onClose();
        // Reset state for future
        setTimeout(() => setStep('options'), 500);
      }, 1500);
    }, 1000);
  };

  const simulateSocialLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        onLoginSuccess();
        onClose();
        setTimeout(() => setStep('options'), 500);
      }, 1500);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
              {/* Subtle gradient background effect */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
              
              <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-50 bg-gray-100 dark:bg-white/5 rounded-full p-2 cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6 text-accent">
                  {step === 'options' && <MapPin className="w-8 h-8" />}
                  {step === 'phone' && <Smartphone className="w-8 h-8" />}
                  {step === 'otp' && <ShieldCheck className="w-8 h-8" />}
                  {step === 'success' && <MapPin className="w-8 h-8" />}
                </div>
                <h2 className="text-3xl font-sora font-bold text-foreground mb-2">
                  {step === 'options' ? 'Join Localite' : step === 'phone' ? 'Welcome Back' : step === 'otp' ? 'Verify OTP' : 'Login Successful!'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-inter text-sm">
                  {step === 'options' ? 'Sign in to save your favorite spots' : step === 'phone' ? 'Enter your phone number to continue' : step === 'otp' ? `Enter the 4-digit code sent to ${phone}` : 'Locating your neighborhood...'}
                </p>
              </div>

              <div className="relative z-10">
                {step === 'options' && (
                  <div className="space-y-4">
                    <button onClick={simulateSocialLogin} className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-foreground font-medium">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/><path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853"/></svg>
                      Continue with Google
                    </button>
                    <button onClick={simulateSocialLogin} className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-foreground font-medium">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M16.365 21.444c-1.554.912-3.136.96-4.524 0-1.476-.984-3.372-2.34-5.304-4.872-2.196-2.88-3.72-6.504-3.468-9.972.192-2.652 1.344-4.632 3.024-5.748 1.572-1.044 3.324-1.056 4.704-.42 1.356.624 2.148.624 3.516 0 1.56-.684 3.168-.516 4.548.456 1.488.948 2.508 2.472 2.928 4.2-2.88.924-4.404 4.044-3.036 6.948 1.092 2.316 3.696 3.48 4.608 3.552-.852 2.376-2.58 4.416-4.488 5.628v.228zm-2.784-17.76c.456-1.596.084-3.168-.96-4.236-1.428-1.428-3.348-1.68-4.548-1.284-.492 1.62-.06 3.276.996 4.38 1.38 1.44 3.348 1.704 4.512 1.14z"/></svg>
                      Continue with Apple
                    </button>
                    
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-[#0a0a0a] text-gray-500 font-inter">or</span>
                      </div>
                    </div>
                    
                    <button onClick={() => setStep('phone')} className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-foreground text-background dark:bg-white dark:text-black hover:opacity-90 transition-opacity font-semibold shadow-md">
                      <Smartphone className="w-5 h-5" />
                      Continue with Phone
                    </button>
                  </div>
                )}

                {step === 'phone' && (
                  <form onSubmit={handleSendOTP} className="space-y-5">
                    <div>
                      <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
                        <span className="inline-flex items-center px-4 bg-gray-50 dark:bg-white/5 text-gray-500 font-medium border-r border-gray-200 dark:border-white/10">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="flex-1 block w-full px-4 py-3.5 bg-white dark:bg-black/50 text-foreground sm:text-base outline-none"
                          placeholder="98765 43210"
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={phone.length < 10 || loading}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-base font-semibold text-white bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                    <div className="text-center">
                      <button type="button" onClick={() => setStep('options')} className="text-sm text-gray-500 hover:text-accent transition-colors font-medium">
                        Back to options
                      </button>
                    </div>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="block w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 text-foreground text-center text-3xl tracking-[1em] focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all shadow-sm font-bold"
                        placeholder="••••"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={otp.length < 4 || loading}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-base font-semibold text-white bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                    <div className="text-center">
                      <button type="button" onClick={() => setStep('phone')} className="text-sm text-gray-500 hover:text-accent transition-colors font-medium">
                        Change phone number
                      </button>
                    </div>
                  </form>
                )}
                
                {step === 'success' && (
                  <div className="flex justify-center pb-4 py-8">
                    <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,111,97,0.3)]"></div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

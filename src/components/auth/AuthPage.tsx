import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { User, UserSession } from '../../types';

interface AuthPageProps {
  onLoginSuccess: (session: UserSession) => void;
  inactivityMessage?: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  inactivityMessage,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify' | 'forgot'>('login');

  // Login form state (fields MUST start empty)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Unchecked by default
  const [loginError, setLoginError] = useState<string | null>(inactivityMessage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Email verification state
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Password strength calculation
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-gray-200', textCol: 'text-gray-400' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', textCol: 'text-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', textCol: 'text-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500', textCol: 'text-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-500' };
      default:
        return { score: 1, label: 'Weak', color: 'bg-red-500', textCol: 'text-red-500' };
    }
  };

  const strength = calculateStrength(signupPassword);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const result = AuthService.login(loginEmail, loginPassword, rememberMe);
    setIsSubmitting(false);

    if (result.success && result.session) {
      onLoginSuccess(result.session);
    } else {
      if (result.error?.includes('Email not verified')) {
        setVerifyEmail(loginEmail);
        setMode('verify');
      }
      setLoginError(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  // Handle Demo Login (Only runs when explicitly clicked)
  const handleDemoLogin = () => {
    const session = AuthService.loginDemo();
    onLoginSuccess(session);
  };

  // Handle Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (strength.score < 2) {
      setSignupError('Please choose a stronger password (minimum 8 characters with numbers or uppercase).');
      return;
    }

    const result = AuthService.register(signupName, signupEmail, signupPassword);
    if (!result.success) {
      setSignupError(result.error || 'Registration failed.');
      return;
    }

    setVerifyEmail(signupEmail);
    setSimulatedCode(result.verificationCode || null);
    setMode('verify');
  };

  // Handle Verification
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);

    const res = AuthService.verifyEmail(verifyEmail, verificationCode);
    if (!res.success) {
      setVerifyError(res.error || 'Verification failed. Check the 6-digit code.');
      return;
    }

    setVerifySuccess('Email verified successfully! You can now log in.');
    setTimeout(() => {
      setMode('login');
      setLoginEmail(verifyEmail);
      setVerifySuccess(null);
    }, 1500);
  };

  // Handle Resend Verification Code
  const handleResendCode = () => {
    const res = AuthService.resendVerificationCode(verifyEmail);
    if (res.success && res.code) {
      setSimulatedCode(res.code);
      setVerifySuccess('New code generated and sent.');
      setTimeout(() => setVerifySuccess(null), 3000);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotStep === 'request') {
      const res = AuthService.forgotPassword(forgotEmail);
      if (!res.success) {
        setForgotError(res.error || 'Email not found.');
        return;
      }
      setSimulatedCode(res.tempCode || null);
      setForgotStep('reset');
      setForgotSuccess('Reset code sent to your campus inbox.');
    } else {
      const res = AuthService.resetPassword(forgotEmail, resetCode, newPassword);
      if (!res.success) {
        setForgotError(res.error || 'Password reset failed.');
        return;
      }
      setForgotSuccess('Password updated successfully! Please log in with your new password.');
      setTimeout(() => {
        setMode('login');
        setForgotStep('request');
        setForgotSuccess(null);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      {/* Brand header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-3 backdrop-blur-md">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Verified Campus Network • Auth Guard Active</span>
        </div>
        <div className="flex items-center justify-center gap-2.5 text-white">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
            ♻️
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight">
            Campus<span className="text-indigo-400">Share</span>
          </span>
        </div>
        <p className="text-xs text-indigo-200/80 mt-1 max-w-sm mx-auto">
          Rent & Reuse study gear, electronics, sports equipment, and hostel essentials.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

        {/* Inactivity notice if logged out due to 30 mins timeout */}
        {inactivityMessage && mode === 'login' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{inactivityMessage}</span>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-black text-gray-900">Sign In to CampusShare</h1>
                <p className="text-xs text-gray-500">Enter your credentials to access the platform</p>
              </div>
              <button
                onClick={() => {
                  setMode('signup');
                  setLoginError(null);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Create Account
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Campus Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-xs sm:text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotEmail(loginEmail);
                      setForgotError(null);
                    }}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-xs sm:text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox (unchecked by default per requirements) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span className="text-[11px]">Remember me</span>
                </label>
                <span className="text-[10px] text-gray-400">Auto-logout after 30m idle</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <span className="bg-white px-2">Or quick explore</span>
              </div>
            </div>

            {/* Demo Login Button (Only allowed when clicked) */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Demo Login (Sample Student Account)</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Opens a preview session with sample listings and a visible Demo Mode banner.
            </p>
          </div>
        )}

        {/* SIGNUP MODE */}
        {mode === 'signup' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-black text-gray-900">Create Student Account</h1>
                <p className="text-xs text-gray-500">Join your verified college sharing ring</p>
              </div>
              <button
                onClick={() => {
                  setMode('login');
                  setSignupError(null);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Sign In
              </button>
            </div>

            {signupError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{signupError}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-xs sm:text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">College Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="sarah.c@campus.edu"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-xs sm:text-sm text-gray-900"
                  />
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Requires email verification code before first access</div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-xs sm:text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter (as required by prompt) */}
                {signupPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-500">Password strength:</span>
                      <span className={`font-black ${strength.textCol}`}>{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Email Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* EMAIL VERIFICATION SCREEN (before first access) */}
        {mode === 'verify' && (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                ✉️
              </div>
              <h1 className="text-xl font-black text-gray-900">Verify Your Email</h1>
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to <b className="text-gray-800">{verifyEmail}</b>
              </p>
            </div>

            {/* Verification Simulator Banner for easy testing */}
            {simulatedCode && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900">
                <div className="font-bold flex items-center gap-1 mb-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Campus Mail Simulator:</span>
                </div>
                <div>Your 6-digit verification code is: <b className="text-indigo-700 text-sm font-mono tracking-widest">{simulatedCode}</b></div>
                <button
                  type="button"
                  onClick={() => setVerificationCode(simulatedCode)}
                  className="mt-1 text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Click to auto-fill code
                </button>
              </div>
            )}

            {verifySuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{verifySuccess}</span>
              </div>
            )}

            {verifyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 text-center mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-widest font-mono text-xl py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Verify & Activate Account
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-gray-500 hover:text-gray-800"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-gray-900">Reset Password</h1>
              <p className="text-xs text-gray-500 mt-1">
                {forgotStep === 'request'
                  ? 'Enter your registered email to receive a recovery code'
                  : 'Enter the recovery code and your new password'}
              </p>
            </div>

            {/* Simulator banner for testing */}
            {simulatedCode && forgotStep === 'reset' && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <div>Password Reset Code: <b className="text-amber-800 text-sm font-mono tracking-widest">{simulatedCode}</b></div>
                <button
                  type="button"
                  onClick={() => setResetCode(simulatedCode)}
                  className="mt-1 text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  Click to auto-fill code
                </button>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              {forgotStep === 'request' ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Campus Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@campus.edu"
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-xs sm:text-sm text-gray-900"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reset Code</label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {forgotStep === 'request' ? 'Send Recovery Code' : 'Save New Password'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotStep('request');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Safety & Circular Footer */}
      <div className="mt-8 text-center text-xs text-indigo-300/70">
        CampusShare • Peer-to-Peer Rental Network • All accounts ID-verified
      </div>
    </div>
  );
};

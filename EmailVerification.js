import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { IconMail, IconCheck, IconX, IconRefresh } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { verifyEmail, resendVerification } from '../api';

const EmailVerification = () => {
  const [status, setStatus] = useState('input'); // input, verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // No automatic verification on page load
  }, []);

  const verifyEmailOTP = async () => {
    if (!email || !otp) {
      setMessage('Please enter both email and verification code');
      return;
    }
    setLoading(true);
    try {
      const { data } = await verifyEmail({ email, otp });
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed';
      if (errorMessage.includes('expired')) {
        setStatus('expired');
      } else {
        setStatus('error');
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { data } = await resendVerification({ email });
      setMessage('✓ Verification code sent! Check your email.');
      setOtp(''); // Clear the old OTP
      setStatus('input'); // Keep in input state for them to enter new code
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl sm:p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            {status === 'input' && <IconMail className="h-8 w-8 text-amber-400" />}
            {status === 'verifying' && loading && <IconMail className="h-8 w-8 text-amber-400 animate-pulse" />}
            {status === 'success' && <IconCheck className="h-8 w-8 text-green-400" />}
            {status === 'error' && <IconX className="h-8 w-8 text-red-400" />}
            {status === 'expired' && <IconRefresh className="h-8 w-8 text-orange-400" />}
            {status === 'resent' && <IconMail className="h-8 w-8 text-blue-400" />}
          </div>
          <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Email Verification</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            {status === 'input' && 'Verify Your Email'}
            {status === 'verifying' && 'Verifying your email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'expired' && 'Code Expired'}
            {status === 'resent' && 'Code Sent'}
          </h1>
        </div>

        <div className="space-y-6">
          {status === 'input' && (
            <>
              <p className="text-slate-400">
                Enter your email address and the 6-digit verification code sent to your email.
              </p>
              
              {message && (
                <motion.div
                  className={`rounded-3xl px-4 py-3 text-sm ${
                    message.startsWith('✓')
                      ? 'bg-green-500/10 text-green-200'
                      : 'bg-rose-500/10 text-rose-200'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {message}
                </motion.div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); verifyEmailOTP(); }} className="space-y-4">
                <label className="block text-sm text-slate-300">
                  <span className="mb-2 flex items-center gap-2 text-slate-400">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  <span className="mb-2 flex items-center gap-2 text-slate-400">Verification Code</span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="123456"
                    maxLength="6"
                    className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400 text-center text-2xl font-mono tracking-widest"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-3">Didn't receive the code?</p>
                <button
                  onClick={handleResendVerification}
                  disabled={loading || !email}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Sending...' : 'Resend verification code'}
                </button>
              </div>
            </>
          )}

          {(status === 'verifying' || status === 'success' || status === 'error' || status === 'expired' || status === 'resent') && (
            <p className="text-slate-400">
              {status === 'verifying' && 'Please wait while we verify your email address.'}
              {status === 'success' && 'Your email has been successfully verified. You can now log in to your account.'}
              {status === 'error' && message}
              {status === 'expired' && 'Your verification code has expired. Please request a new one.'}
              {status === 'resent' && 'A new verification code has been sent to your email address.'}
            </p>
          )}

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            <p className="font-semibold mb-2">💡 Development Tip:</p>
            <p>If you don't see an email in your inbox, check the backend terminal/console logs. The verification link will be displayed there when running in test mode.</p>
          </div>

          {status === 'expired' && (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              />
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          {status === 'no-token' && (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              />
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                Resend Verification Email
              </button>
            </div>
          )}

          {(status === 'success' || status === 'resent') && (
            <Link
              to="/login"
              className="inline-block w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 text-center"
            >
              Go to Login
            </Link>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              />
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
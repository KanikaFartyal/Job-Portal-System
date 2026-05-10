import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconEye, IconEyeOff, IconMail, IconLock, IconCheck, IconRefresh } from '@tabler/icons-react';
import { loginUser, verifyEmail, resendVerification } from '../api';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await loginUser({ email: form.email, password: form.password });
      onLogin({ token: data.token, ...data.user }, form.remember);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Check your email and password.';
      if (err.response?.data?.emailVerified === false) {
        setShowVerification(true);
        setError('Please verify your email first.');
        if (err.response?.data?.otpSent) {
          setSuccess('Verification code sent to your email.');
          if (err.response?.data?.previewUrl) {
            setPreviewUrl(err.response.data.previewUrl);
          }
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setSuccess('');
    setVerifying(true);
    try {
      await verifyEmail({ email: form.email, otp: otp.trim() });
      setSuccess('Email verified successfully! Logging you in...');
      // Now login again since email is verified
      const { data } = await loginUser({ email: form.email, password: form.password });
      onLogin({ token: data.token, ...data.user }, form.remember);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed';
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setPreviewUrl('');
    setResending(true);
    try {
      const { data } = await resendVerification({ email: form.email });
      setSuccess(data.message || 'Verification code sent successfully to your email');
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend verification code';
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    setError('');
    setSuccess('');
    setOtp('');
    setPreviewUrl('');
  };

  if (showVerification) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Email Verification</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Verify Your Email</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Please check your email for the verification code.</p>
        </div>

        {error && <p className="mb-4 rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        {success && <p className="mb-4 rounded-3xl bg-green-500/10 px-4 py-3 text-sm text-green-200">{success}</p>}
        {previewUrl && (
          <p className="mb-4 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
            Preview OTP email: <a href={previewUrl} target="_blank" rel="noreferrer" className="text-amber-300 underline">Open email preview</a>
          </p>
        )}

        <div className="space-y-4">
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400"><IconMail size={16} /> Verification Code</span>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              maxLength="6"
            />
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleVerifyOTP}
              disabled={verifying}
              className="flex-1 rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 flex items-center justify-center gap-2"
            >
              {verifying ? 'Verifying...' : 'Verify OTP'}
              {verifying && <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={resending}
              className="flex-1 rounded-3xl border border-white/10 bg-slate-900/85 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-700 flex items-center justify-center gap-2"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
              {resending && <IconRefresh size={16} className="animate-spin" />}
            </button>
          </div>

          <button
            onClick={handleBackToLogin}
            className="w-full rounded-3xl border border-white/10 bg-transparent px-6 py-3 text-sm font-semibold text-slate-400 transition hover:text-white hover:border-white/20"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Welcome back</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Login to your JobHook account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Access your profile, applications, and saved opportunities.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-300">
          <span className="mb-2 flex items-center gap-2 text-slate-400"><IconMail size={16} /> Email</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
        </label>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 flex items-center gap-2 text-slate-400"><IconLock size={16} /> Password</span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 pr-12 text-white outline-none transition focus:border-amber-400"
            />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200">
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="h-4 w-4 rounded border-white/10 bg-slate-900 text-amber-500 focus:ring-amber-500" />
            Remember me
          </label>
          <Link to="/" className="text-amber-300 transition hover:text-white">Forgot password?</Link>
        </div>

        {error && <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700">
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        New here? <Link to="/signup" className="text-amber-300 transition hover:text-white">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;

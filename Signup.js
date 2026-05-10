import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconLock, IconUser, IconMail, IconUpload, IconBriefcase, IconUsers, IconCheck, IconRefresh } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { registerUser, resendVerification } from '../api';

const Signup = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker', remember: true });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAvatar = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const { data } = await resendVerification({ email: form.email });
      setSuccess(data.message);
      setEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.password) {
        setError('Please fill in all fields');
        return;
      }
      setStep(2);
      setError('');
      return;
    }

    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('role', form.role);
    if (avatarFile) formData.append('avatar', avatarFile);
    try {
      const { data } = await registerUser(formData);
      setSuccess(data.message);
      setEmailSent(data.emailSent !== false);
      // Redirect to email verification page
      navigate('/verify-email');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl sm:p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Step 1: Role Selection */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Choose your role</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">Start your JobHook journey</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Select your role to get the most tailored experience.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {/* Job Seeker Card */}
            <motion.button
              type="button"
              onClick={() => setForm({ ...form, role: 'jobseeker' })}
              className={`group relative rounded-2xl border-2 p-6 transition ${
                form.role === 'jobseeker'
                  ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                  : 'border-white/10 bg-slate-900/50 hover:border-amber-400/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <IconBriefcase size={24} className="text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Job Seeker</h3>
                  </div>
                  <p className="text-sm text-slate-400">Find and apply for jobs that match your skills</p>
                </div>
                {form.role === 'jobseeker' && (
                  <div className="rounded-full bg-amber-500 p-1">
                    <IconCheck size={18} className="text-white" />
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>✓ Browse job listings</p>
                <p>✓ Save favorite jobs</p>
                <p>✓ Track applications</p>
              </div>
            </motion.button>

            {/* Recruiter Card */}
            <motion.button
              type="button"
              onClick={() => setForm({ ...form, role: 'employer' })}
              className={`group relative rounded-2xl border-2 p-6 transition ${
                form.role === 'employer'
                  ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                  : 'border-white/10 bg-slate-900/50 hover:border-amber-400/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <IconUsers size={24} className="text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Recruiter / Employer</h3>
                  </div>
                  <p className="text-sm text-slate-400">Post jobs and manage your hiring process</p>
                </div>
                {form.role === 'employer' && (
                  <div className="rounded-full bg-amber-500 p-1">
                    <IconCheck size={18} className="text-white" />
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>✓ Post job openings</p>
                <p>✓ Manage candidates</p>
                <p>✓ Track applicants</p>
              </div>
            </motion.button>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            Continue
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-amber-300 transition hover:text-white">Login</Link>
          </p>
        </motion.div>
      )}

      {/* Step 2: Account Details */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-400 transition hover:text-white"
            >
              ← Back
            </button>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Create account</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Setup your {form.role === 'employer' ? 'recruiter/employer' : 'job seeker'} profile
              </h1>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 flex items-center gap-2 text-slate-400"><IconUser size={16} /> Full Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={form.role === 'employer' ? 'Your name' : 'Your full name'}
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 flex items-center gap-2 text-slate-400"><IconMail size={16} /> Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 flex items-center gap-2 text-slate-400"><IconLock size={16} /> Password</span>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="At least 8 characters"
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 pr-12 text-white outline-none transition focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 flex items-center gap-2 text-slate-400"><IconUpload size={16} /> Profile Image</span>
              <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3">
                <div className="flex-1 text-sm text-slate-300">
                  {form.role === 'employer' ? 'Upload your company logo or profile photo' : 'Upload a profile photo for recruiter visibility'}
                </div>
                <label className="cursor-pointer rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
                  Choose file
                  <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </label>
              </div>
              {avatarPreview && (
                <motion.img
                  src={avatarPreview}
                  alt="avatar preview"
                  className="mt-4 h-24 w-24 rounded-full object-cover border border-amber-400/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </label>

            <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/10 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                Remember me
              </label>
            </div>

            {error && (
              <motion.p
                className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            {success && (
              <motion.div
                className="rounded-3xl bg-green-500/10 px-4 py-3 text-sm text-green-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="font-semibold mb-2">✓ {success}</p>
                <p>Please check your email and click the verification link to complete your registration.</p>
                {!emailSent && (
                  <div className="mt-3">
                    <p className="text-yellow-200 mb-2">Didn't receive the email? Check your spam folder or resend:</p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                    >
                      <IconRefresh size={16} className={resendLoading ? 'animate-spin' : ''} />
                      {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-amber-300 transition hover:text-white">Login</Link>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Signup;

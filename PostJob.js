import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBriefcase, IconBuildingStore, IconMapPin, IconCurrencyDollar } from '@tabler/icons-react';
import { postJob } from '../api';

const PostJob = ({ user }) => {
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'Full-time', salary: '', experience: '', education: '', description: '', skills: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!user) {
      setMessage('Please login to post a job.');
      setMessageType('error');
      return;
    }

    if (!form.title.trim() || !form.company.trim() || !form.location.trim() || !form.description.trim()) {
      setMessage('Please fill in all required fields.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      const jobData = {
        ...form,
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        experience: form.experience ? Number(form.experience) : 0,
        education: form.education.trim()
      };

      console.log('Posting job with data:', jobData);
      console.log('User:', user);
      
      const response = await postJob(jobData);
      
      console.log('Job posted successfully:', response.data);
      setMessage('✓ Job posted successfully! Redirecting to your jobs...');
      setMessageType('success');
      
      // Reset form
      setForm({ title: '', company: '', location: '', type: 'Full-time', salary: '', experience: '', education: '', description: '', skills: '' });
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/posted-jobs');
      }, 1000);
      
    } catch (err) {
      console.error('Job posting error - Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      const errorStatus = err.response?.status;
      const errorDetail = err.response?.data?.detail || '';
      const errorMessage = err.response?.data?.message || err.message || 'Unable to post job.';
      const fullMessage = `${errorMessage}${errorDetail ? ` (${errorDetail})` : ''}${errorStatus ? ` [${errorStatus}]` : ''}`;
      
      setMessage(fullMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
      <div>
        <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Employer tools</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Post a new job</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Create a job post and attract qualified candidates fast.</p>
      </div>

      {message && (
        <div className={`rounded-3xl p-4 text-sm ${messageType === 'success' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`}>
          {message}
        </div>
      )}

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400"><IconBriefcase size={16} /> Job title</span>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400"><IconBuildingStore size={16} /> Company</span>
            <input name="company" value={form.company} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400"><IconMapPin size={16} /> Location</span>
            <input name="location" value={form.location} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400"><IconCurrencyDollar size={16} /> Salary</span>
            <input name="salary" value={form.salary} onChange={handleChange} placeholder="Optional" className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400"><IconBriefcase size={16} /> Type</span>
            <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400">
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400">Minimum experience (years)</span>
            <input name="experience" value={form.experience} onChange={handleChange} type="number" min="0" placeholder="0" className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2 text-slate-400">Required education</span>
            <input name="education" value={form.education} onChange={handleChange} placeholder="Bachelor's degree" className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 text-slate-400">Skills (comma separated)</span>
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, CSS" className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
        </label>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 text-slate-400">Description</span>
          <textarea name="description" value={form.description} onChange={handleChange} required rows="6" className="w-full rounded-[2rem] border border-white/10 bg-slate-900/85 px-4 py-4 text-white outline-none transition focus:border-amber-400" />
        </label>

        <button type="submit" disabled={loading} className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700">
          {loading ? 'Posting job…' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;

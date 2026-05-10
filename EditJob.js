import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconBriefcase, IconBuildingStore, IconMapPin, IconCurrencyDollar } from '@tabler/icons-react';
import { fetchJobDetail, updateJob } from '../api';

const EditJob = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'Full-time', salary: '', experience: '', education: '', description: '', skills: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      try {
        const { data } = await fetchJobDetail(id);
        setForm({
          title: data.title || '',
          company: data.company || '',
          location: data.location || '',
          type: data.type || 'Full-time',
          salary: data.salary || '',
          experience: data.experience?.toString() || '',
          education: data.education || '',
          description: data.description || '',
          skills: (data.skills || []).join(', ')
        });
      } catch (err) {
        setMessage('Unable to load job details.');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');
    setSaving(true);
    try {
      await updateJob(id, {
        ...form,
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
      });
      setMessage('Job updated successfully. Redirecting…');
      setMessageType('success');
      setTimeout(() => navigate('/posted-jobs'), 800);
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data?.detail || 'Unable to update job.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-400">Loading job details…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
      <button onClick={() => navigate('/posted-jobs')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
        <IconArrowLeft size={18} /> Back to Posted Jobs
      </button>

      <div>
        <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Edit job</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Update your job posting</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Make quick edits and keep your listing up to date.</p>
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
            <span className="mb-2 flex items-center gap-2 text-slate-400">Experience</span>
            <input name="experience" value={form.experience} onChange={handleChange} type="number" min="0" placeholder="0" className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 text-slate-400">Required education</span>
          <input name="education" value={form.education} onChange={handleChange} placeholder="Bachelor's degree" className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
        </label>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 text-slate-400">Skills (comma separated)</span>
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, CSS" className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
        </label>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 text-slate-400">Description</span>
          <textarea name="description" value={form.description} onChange={handleChange} required rows="6" className="w-full rounded-[2rem] border border-white/10 bg-slate-900/85 px-4 py-4 text-white outline-none transition focus:border-amber-400" />
        </label>

        <button type="submit" disabled={saving} className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700">
          {saving ? 'Saving changes…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditJob;

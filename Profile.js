import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconFileDescription, IconCamera, IconUpload, IconInfoCircle } from '@tabler/icons-react';
import { fetchProfile, updateProfile } from '../api';

const educationTypes = ['High School', 'Intermediate', 'Bachelors', 'Masters'];
const bachelorDegrees = ['BCA', 'BBA', 'BTech', 'BCom', 'BSc', 'BA'];
const masterDegrees = ['MCA', 'MBA', 'MTech', 'MSc', 'MA'];
const yearOptions = Array.from({ length: 25 }, (_, index) => `${2002 + index}`);

const fields = [
  'name',
  'email',
  'phone',
  'address',
  'college',
  'degree',
  'educationDetails',
  'skills',
  'experience',
  'linkedin',
  'github',
  'about',
  'resumePath'
];

const createEducationEntry = (type = 'High School') => ({
  clientId: `temp-${Date.now()}-${Math.random()}`,
  type,
  degree: '',
  schoolName: '',
  boardName: '',
  collegeName: '',
  universityName: '',
  startYear: '',
  endYear: '',
  expectedGraduationYear: '',
  current: false,
  noBacklogs: true,
  specialization: '',
  percentage: '',
  cgpa: '',
  skillsLearned: '',
  currentSemester: '',
  city: '',
  state: ''
});

const SearchableSelect = ({ label, options, value, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  return (
    <label className="space-y-2 text-sm text-slate-300">
      {label}
      <div className="relative">
        <input
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
        />
        <button type="button" onClick={() => setOpen((prev) => !prev)} className="absolute right-3 top-3 text-slate-400">
          ▾
        </button>
        {open && (
          <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-3xl border border-white/10 bg-slate-950/95 shadow-xl">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(option);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="w-full cursor-pointer px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-amber-500/10"
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">No results found</div>
            )}
          </div>
        )}
      </div>
    </label>
  );
};

const FloatingInput = ({ label, value, onChange, placeholder = '' }) => (
  <label className="relative block">
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder || ' '}
      className="peer w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-4 text-white outline-none transition focus:border-amber-400"
    />
    <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs peer-focus:text-amber-300">
      {label}
    </span>
  </label>
);

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([createEducationEntry()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        const { data } = await fetchProfile();
        setProfile(data);
        setAvatarPreview(data.avatarPath || '');
        const savedDraft = localStorage.getItem('jobportal_education_draft');
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEducation(parsed);
              setDraftMessage('Loaded local education draft. Save or continue editing.');
            } else {
              setEducation(data.education?.length ? data.education : [createEducationEntry()]);
            }
          } catch {
            setEducation(data.education?.length ? data.education : [createEducationEntry()]);
          }
        } else {
          setEducation(data.education?.length ? data.education : [createEducationEntry()]);
        }
      } catch (error) {
        setMessage('Unable to load profile data. Please sign in and try again.');
      }
    };
    load();
  }, [navigate, user]);

  useEffect(() => {
    localStorage.setItem('jobportal_education_draft', JSON.stringify(education));
  }, [education]);

  const educationCompletion = (entry) => {
    const keys = [
      entry.type,
      entry.degree || entry.schoolName || entry.collegeName,
      entry.startYear,
      entry.current ? entry.expectedGraduationYear : entry.endYear,
      entry.percentage || entry.cgpa,
      entry.city,
      entry.state
    ];
    const filled = keys.filter(Boolean).length;
    return Math.round((filled / keys.length) * 100);
  };

  const completion = useMemo(() => {
    if (!profile) return 0;
    const filled = fields.reduce((count, field) => {
      const value = profile[field];
      if (Array.isArray(value)) return value.length ? count + 1 : count;
      if (typeof value === 'string') return value.trim() ? count + 1 : count;
      return count;
    }, 0);
    const educationPoints = education.length ? Math.min(10, education.filter((entry) => educationCompletion(entry) >= 80).length * 2) : 0;
    return Math.round(((filled + educationPoints) / (fields.length + 10)) * 100);
  }, [profile, education]);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleEducationChange = (index, key, value) => {
    const next = education.map((entry, idx) => (idx === index ? { ...entry, [key]: value } : entry));
    setEducation(next);
    setProfile((prev) => ({ ...prev, education: next }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleAddEducation = () => {
    const next = [...education, createEducationEntry()];
    setEducation(next);
    setDraftMessage('Added a new education card.');
  };

  const handleRemoveEducation = (index) => {
    const next = education.filter((_, idx) => idx !== index);
    setEducation(next.length ? next : [createEducationEntry()]);
    setDraftMessage('Removed education card locally. Save to persist.');
  };

  const saveDraft = () => {
    localStorage.setItem('jobportal_education_draft', JSON.stringify(education));
    setDraftMessage('Education draft saved locally.');
  };

  const getEducationErrors = (entry) => {
    const errors = [];
    if (!entry.type) errors.push('Education type is required.');

    if (['High School', 'Intermediate'].includes(entry.type)) {
      if (!entry.schoolName) errors.push('School name is required.');
      if (!entry.boardName) errors.push('Board name is required.');
    }

    if (['Bachelors', 'Masters'].includes(entry.type)) {
      if (!entry.degree) errors.push('Degree type is required.');
      if (!entry.collegeName) errors.push('College name is required.');
      if (!entry.universityName) errors.push('University name is required.');
    }

    if (!entry.startYear) errors.push('Start year is required.');
    if (!entry.current && !entry.endYear) errors.push('Ending year is required unless currently pursuing.');
    if (entry.current && !entry.expectedGraduationYear) errors.push('Expected graduation year is required for current study.');
    if (entry.percentage && Number(entry.percentage) > 100) errors.push('Percentage cannot exceed 100.');
    if (entry.cgpa && (Number(entry.cgpa) < 0 || Number(entry.cgpa) > 10)) errors.push('CGPA must be between 0 and 10.');
    if (!entry.city) errors.push('City is required.');
    if (!entry.state) errors.push('State is required.');
    if (entry.startYear && entry.endYear && Number(entry.endYear) < Number(entry.startYear)) errors.push('End year cannot be before start year.');

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profile) return;

    const hasErrors = education.some((entry) => getEducationErrors(entry).length > 0);
    if (hasErrors) {
      setMessage('Please fix the highlighted education cards before saving.');
      return;
    }

    setSaving(true);
    setMessage('');
    const formData = new FormData();
    Object.entries({ ...profile, education }).forEach(([key, value]) => {
      if (key === 'skills' && Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else if (key === 'education') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    if (avatarFile) formData.append('avatar', avatarFile);
    if (resumeFile) formData.append('resume', resumeFile);

    try {
      const { data } = await updateProfile(formData);
      setProfile(data);
      setEducation(data.education?.length ? data.education : education);
      localStorage.removeItem('jobportal_education_draft');
      setMessage('Profile updated successfully.');
      setDraftMessage('');
    } catch (error) {
      setMessage('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="rounded-3xl bg-slate-900/80 p-8 text-slate-400">
        {message || 'Loading profile…'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Profile</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Job Seeker Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Update your education with dynamic cards, dropdowns, and professional structure.</p>
          </div>
          <div className="max-w-xs rounded-3xl bg-slate-900/90 p-5 text-center shadow-lg">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Completion</p>
            <p className="mt-3 text-4xl font-semibold text-amber-300">{completion}%</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <motion.div layout className="rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
          <div className="grid gap-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Personal profile</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Account details</h2>
                </div>
                <div className="flex items-center gap-2 rounded-3xl bg-slate-900/85 px-4 py-3 text-sm text-slate-300">
                  <IconCamera size={18} /> Avatar upload
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingInput label="Full Name" value={profile.name} onChange={(value) => handleChange('name', value)} />
                <FloatingInput label="Email" value={profile.email} onChange={() => {}} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingInput label="Phone Number" value={profile.phone} onChange={(value) => handleChange('phone', value)} />
                <FloatingInput label="Address" value={profile.address} onChange={(value) => handleChange('address', value)} />
              </div>
            </section>

            <section className="space-y-4 rounded-4xl border border-white/10 bg-slate-900/85 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Education overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Academic summary</h2>
                <p className="mt-2 text-sm text-slate-400">Create structured education entries that reflect your academic journey professionally.</p>
              </div>
              <label className="space-y-2 text-sm text-slate-300">
                Education summary
                <textarea
                  value={profile.educationDetails}
                  onChange={(event) => handleChange('educationDetails', event.target.value)}
                  rows={3}
                  className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                  placeholder="Summarize your academic focus, awards, or key achievements."
                />
              </label>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={handleAddEducation} className="inline-flex items-center justify-center rounded-3xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm text-amber-200 transition hover:border-amber-300 hover:bg-amber-500/20">
                + Add Another Education
              </button>
              <button type="button" onClick={saveDraft} className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm text-slate-200 transition hover:border-amber-300 hover:bg-slate-900/95">
                Save Draft
              </button>
              {draftMessage && <p className="text-sm text-amber-200">{draftMessage}</p>}
            </div>

            <div className="grid gap-5">
              {education.map((entry, index) => {
                const errors = getEducationErrors(entry);
                return (
                  <motion.div key={entry._id ?? entry.clientId ?? index} layout className="overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-glow transition hover:-translate-y-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Education card</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{entry.type}</h3>
                        <p className="mt-1 text-sm text-slate-400">Structured form fields adjust by education level.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">{educationCompletion(entry)}% complete</span>
                        <button type="button" onClick={() => handleRemoveEducation(index)} className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20">Delete</button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <SearchableSelect label="Education type" options={educationTypes} value={entry.type} onSelect={(value) => handleEducationChange(index, 'type', value)} placeholder="Choose education type" />
                      {['Bachelors', 'Masters'].includes(entry.type) ? (
                        <SearchableSelect
                          label="Degree type"
                          options={entry.type === 'Bachelors' ? bachelorDegrees : masterDegrees}
                          value={entry.degree}
                          onSelect={(value) => handleEducationChange(index, 'degree', value)}
                          placeholder="Choose degree"
                        />
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {['High School', 'Intermediate'].includes(entry.type) ? (
                        <>
                          <FloatingInput label="School Name" value={entry.schoolName} onChange={(value) => handleEducationChange(index, 'schoolName', value)} />
                          <FloatingInput label="Board Name" value={entry.boardName} onChange={(value) => handleEducationChange(index, 'boardName', value)} />
                        </>
                      ) : (
                        <>
                          <FloatingInput label="College Name" value={entry.collegeName} onChange={(value) => handleEducationChange(index, 'collegeName', value)} />
                          <FloatingInput label="University Name" value={entry.universityName} onChange={(value) => handleEducationChange(index, 'universityName', value)} />
                        </>
                      )}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <SearchableSelect label="Start year" options={yearOptions} value={entry.startYear} onSelect={(value) => handleEducationChange(index, 'startYear', value)} placeholder="Start year" />
                      {entry.current ? (
                        <SearchableSelect label="Expected graduation year" options={yearOptions} value={entry.expectedGraduationYear} onSelect={(value) => handleEducationChange(index, 'expectedGraduationYear', value)} placeholder="Expected year" />
                      ) : (
                        <SearchableSelect label="Ending year" options={yearOptions} value={entry.endYear} onSelect={(value) => handleEducationChange(index, 'endYear', value)} placeholder="End year" />
                      )}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <FloatingInput label="Percentage / CGPA" value={entry.percentage || entry.cgpa} onChange={(value) => handleEducationChange(index, 'percentage', value)} />
                      {['Bachelors', 'Masters'].includes(entry.type) ? (
                        <FloatingInput label="Current semester" value={entry.currentSemester} onChange={(value) => handleEducationChange(index, 'currentSemester', value)} />
                      ) : (
                        <FloatingInput label="City" value={entry.city} onChange={(value) => handleEducationChange(index, 'city', value)} />
                      )}
                    </div>

                    {['Bachelors', 'Masters'].includes(entry.type) && (
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <FloatingInput label="Specialization" value={entry.specialization} onChange={(value) => handleEducationChange(index, 'specialization', value)} />
                        <FloatingInput label="Skills learned" value={entry.skillsLearned} onChange={(value) => handleEducationChange(index, 'skillsLearned', value)} />
                      </div>
                    )}

                    {!['High School', 'Intermediate'].includes(entry.type) && (
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <FloatingInput label="City" value={entry.city} onChange={(value) => handleEducationChange(index, 'city', value)} />
                        <FloatingInput label="State" value={entry.state} onChange={(value) => handleEducationChange(index, 'state', value)} />
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <label className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                        <input type="checkbox" checked={entry.noBacklogs} onChange={(event) => handleEducationChange(index, 'noBacklogs', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900 text-amber-400 focus:ring-amber-400" />
                        No active backlogs
                      </label>
                      {['Bachelors', 'Masters'].includes(entry.type) && (
                        <label className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                          <input type="checkbox" checked={entry.current} onChange={(event) => handleEducationChange(index, 'current', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900 text-amber-400 focus:ring-amber-400" />
                          Currently pursuing
                        </label>
                      )}
                    </div>

                    {errors.length > 0 && (
                      <div className="mt-4 rounded-3xl bg-rose-500/10 p-4 text-sm text-rose-200">
                        <p className="font-semibold">Fix these fields:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {errors.map((error) => (<li key={error}>{error}</li>))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div layout className="space-y-6 rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
          <div className="space-y-4 rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Media panel</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Avatar & resume</h2>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-4 text-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar preview" className="mx-auto h-32 w-32 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-white/5 text-amber-300">
                    <IconCamera size={30} />
                  </div>
                )}
                <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300 hover:bg-amber-500/10">
                  <IconUpload size={16} className="mr-2" /> Upload Avatar
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Resume</p>
                    <p className="mt-2 text-sm text-slate-300">Upload your CV in PDF or DOC format.</p>
                  </div>
                  <IconFileDescription className="text-amber-300" size={24} />
                </div>
                <div className="mt-5 space-y-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-amber-300 hover:bg-amber-500/10">
                    <IconUpload size={16} /> Attach Resume
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
                  </label>
                  {resumeFile ? (
                    <p className="text-sm text-slate-200">Selected file: <span className="font-semibold text-white">{resumeFile.name}</span></p>
                  ) : profile.resumePath ? (
                    <a href={profile.resumePath} target="_blank" rel="noreferrer" className="text-sm text-amber-300 underline">View uploaded resume</a>
                  ) : (
                    <p className="text-sm text-slate-500">No resume uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <div className="flex items-center gap-3 text-slate-300">
              <IconInfoCircle size={18} />
              <p className="text-sm">A robust education section increases recruiter confidence and gives your profile a polished resume feel.</p>
            </div>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-600">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
            {message && <p className="text-sm text-amber-200">{message}</p>}
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default Profile;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconFileDescription,
  IconCamera,
  IconUpload,
  IconPlus,
  IconX,
  IconSchool,
  IconCalendar,
  IconCheck,
  IconBuilding,
  IconArrowLeft,
  IconArrowRight,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { fetchProfile, updateProfile } from './api';
import EducationModal from './components/EducationModal';

const educationTypes = ['High School', 'Intermediate', 'Bachelors', 'Masters'];
const bachelorDegrees = ['BCA', 'BBA', 'BTech', 'BCom', 'BSc', 'BA'];
const masterDegrees = ['MCA', 'MBA', 'MTech', 'MSc', 'MA'];
const yearOptions = Array.from({ length: 30 }, (_, index) => `${2000 + index}`);

const createEducationEntry = (type = 'High School') => ({
  _id: `temp-${Date.now()}-${Math.random()}`,
  type,
  degree: '',
  schoolName: '',
  boardName: '',
  collegeName: '',
  universityName: '',
  startYear: '',
  endYear: '',
  current: false,
  expectedGraduationYear: '',
  percentage: '',
  cgpa: '',
  currentSemester: '',
  skillsLearned: '',
  noBacklogs: true,
});

const fieldIsDegree = (type) => type === 'Bachelors' || type === 'Masters';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);
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
        setEducation(data.education?.length ? data.education : []);
      } catch {
        setMessage('Unable to load profile data. Please sign in and try again.');
      }
    };

    load();
  }, [navigate, user]);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const required = ['name', 'email', 'phone', 'address', 'skills', 'experience'];
    const filled = required.reduce((count, field) => {
      const value = profile[field];
      if (Array.isArray(value)) return value.length ? count + 1 : count;
      if (typeof value === 'string') return value.trim() ? count + 1 : count;
      return count;
    }, 0);
    const educationScore = Math.min(10, education.length * 2);
    return Math.round(((filled + educationScore) / (required.length + 10)) * 100);
  }, [profile, education]);

  const handleProfileChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddEducation = () => {
    setEditingEducationIndex(null);
    setIsModalOpen(true);
  };

  const handleEditEducation = (index) => {
    setEditingEducationIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveEducation = (eduData) => {
    if (editingEducationIndex !== null) {
      // Update existing
      const updated = [...education];
      updated[editingEducationIndex] = { ...eduData, _id: updated[editingEducationIndex]._id };
      setEducation(updated);
    } else {
      // Add new
      setEducation([...education, { ...eduData, _id: `edu-${Date.now()}-${Math.random()}` }]);
    }
    setIsModalOpen(false);
    setEditingEducationIndex(null);
  };

  const handleDeleteEducation = (index) => {
    setEducation((prev) => prev.filter((_, idx) => idx !== index));
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
    if (file) setResumeFile(file);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage('');

    const payload = new FormData();
    payload.append('name', profile.name || '');
    payload.append('phone', profile.phone || '');
    payload.append('address', profile.address || '');
    payload.append('college', profile.college || '');
    payload.append('degree', profile.degree || '');
    payload.append('educationDetails', profile.educationDetails || '');
    payload.append('experience', profile.experience || '');
    payload.append('linkedin', profile.linkedin || '');
    payload.append('github', profile.github || '');
    payload.append('about', profile.about || '');
    payload.append('education', JSON.stringify(education || []));
    payload.append('skills', JSON.stringify(profile.skills || []));

    if (avatarFile) payload.append('avatar', avatarFile);
    if (resumeFile) payload.append('resume', resumeFile);

    try {
      const { data } = await updateProfile(payload);
      const updatedUser = data.user || data;
      setProfile(updatedUser);
      setEducation(updatedUser.education || []);
      setAvatarPreview(updatedUser.avatarPath || avatarPreview);

      const storage = localStorage.getItem('jobportal_user') ? localStorage : sessionStorage.getItem('jobportal_user') ? sessionStorage : null;
      if (storage) {
        const storedUser = JSON.parse(storage.getItem('jobportal_user') || '{}');
        const mergedUser = {
          ...storedUser,
          ...updatedUser,
        };
        storage.setItem('jobportal_user', JSON.stringify(mergedUser));
      }

      setMessage('Profile saved successfully.');
    } catch (error) {
      console.error('Profile save failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Unable to save profile. Please try again.';
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderEducationCards = () => {
    return education.map((entry, index) => {
      const title = fieldIsDegree(entry.type) ? entry.degree : entry.type;
      const institution = fieldIsDegree(entry.type) ? entry.collegeName : entry.schoolName;
      const subtitle = fieldIsDegree(entry.type) ? entry.universityName : entry.boardName;
      const dates = entry.current
        ? `${entry.startYear} • Pursuing`
        : `${entry.startYear} - ${entry.endYear}`;

      return (
        <motion.div
          key={entry._id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="group rounded-2xl border border-amber-300/20 bg-gradient-to-br from-slate-900/80 via-slate-950/50 to-slate-900/80 p-5 shadow-lg transition hover:border-amber-300/40 hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">{entry.type}</p>
              <h3 className="mt-1.5 text-lg font-semibold text-white truncate">{title}</h3>
              <p className="mt-0.5 text-sm text-slate-300 line-clamp-1">{institution}</p>
              {subtitle && <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>}
            </div>
            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => handleEditEducation(index)}
                className="rounded-lg border border-white/10 bg-amber-500/20 p-2 text-amber-300 transition hover:bg-amber-500/30 hover:border-amber-400/50"
                title="Edit"
              >
                <IconEdit size={16} />
              </button>
              <button
                onClick={() => handleDeleteEducation(index)}
                className="rounded-lg border border-white/10 bg-rose-500/20 p-2 text-rose-300 transition hover:bg-rose-500/30 hover:border-rose-400/50"
                title="Delete"
              >
                <IconTrash size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <IconCalendar size={14} />
              {dates}
            </div>
            {entry.cgpa && (
              <div className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200">
                {entry.cgpa} CGPA
              </div>
            )}
            {entry.percentage && !entry.cgpa && (
              <div className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200">
                {entry.percentage}%
              </div>
            )}
          </div>

          {entry.skillsLearned && (
            <p className="mt-2.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Skills:</span> {entry.skillsLearned}
            </p>
          )}
        </motion.div>
      );
    });
  };

  if (!profile) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 text-slate-400">{message || 'Loading profile…'}</div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Job Seeker Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Your education cards are now displayed cleanly after saving.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-5 text-center shadow-lg">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Completion</p>
            <p className="mt-3 text-4xl font-semibold text-amber-300">{completion}%</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <motion.div layout className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-2xl">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Personal details</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Account details</h2>
                <div className="mt-5 grid gap-4">
                  <input value={profile.name} onChange={(event) => handleProfileChange('name', event.target.value)} placeholder="Full name" className="w-full rounded-3xl border border-white/10 bg-slate-950/85 px-4 py-3 text-white outline-none" />
                  <input value={profile.email} disabled placeholder="Email" className="w-full rounded-3xl border border-white/10 bg-slate-950/85 px-4 py-3 text-slate-400 outline-none" />
                  <div className="flex items-center gap-2">
                    {user.emailVerified ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <IconCheck size={16} />
                        <span className="text-sm font-medium">Email Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-400">
                        <IconX size={16} />
                        <span className="text-sm font-medium">Email Not Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Media panel</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Avatar & resume</h2>
                <div className="mt-5 grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 text-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar preview" className="mx-auto h-28 w-28 rounded-full object-cover" />
                    ) : (
                      <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-white/5 text-amber-300">
                        <IconCamera size={28} />
                      </div>
                    )}
                    <label className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300 hover:bg-amber-500/10">
                      <IconUpload size={16} /> Upload Avatar
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Resume</p>
                        <p className="mt-1 text-sm text-slate-300">Upload your CV in PDF or DOC format.</p>
                      </div>
                      <IconFileDescription size={22} className="text-amber-300" />
                    </div>
                    <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300 hover:bg-amber-500/10">
                      <IconUpload size={16} /> Attach Resume
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
                    </label>
                    {resumeFile ? (
                      <p className="mt-3 text-sm text-slate-200">Selected file: <span className="font-semibold text-white">{resumeFile.name}</span></p>
                    ) : profile.resumePath ? (
                      <a href={profile.resumePath} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-amber-300 underline">View uploaded resume</a>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">No resume uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Education</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Your Academic Journey</h2>
                </div>
                <button type="button" onClick={handleAddEducation} className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-amber-400 hover:to-amber-500">
                  <IconPlus size={16} /> Add Education
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {education.length > 0 ? (
                <AnimatePresence>{renderEducationCards()}</AnimatePresence>
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-white/20 bg-slate-900/30 p-8 text-center text-slate-400">
                  <IconSchool size={40} className="mx-auto text-amber-300/60" />
                  <p className="mt-3 text-lg font-semibold text-white">Add your education</p>
                  <p className="mt-1 text-sm text-slate-500">Start building your academic profile by clicking the button above.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div layout className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-2xl">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Save profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Finalize updates</h2>
            <p className="mt-3 text-sm text-slate-400">Save your profile and education in one place.</p>
          </div>
          <button type="button" onClick={handleSaveProfile} disabled={saving} className="inline-flex w-full items-center justify-center rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          {message && <p className="text-sm text-amber-200">{message}</p>}
        </motion.div>
      </div>

      <EducationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEducationIndex(null);
        }}
        onSave={handleSaveEducation}
        editingEntry={editingEducationIndex !== null ? education[editingEducationIndex] : null}
      />
    </div>
  );
};

export default Profile;

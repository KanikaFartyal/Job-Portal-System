import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconMapPin, IconLink, IconBriefcase } from '@tabler/icons-react';
import { fetchJobDetail, fetchProfile, applyJob, saveJob } from '../api';

const JobDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [eligibility, setEligibility] = useState({ eligible: true, reason: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      try {
        const { data } = await fetchJobDetail(id);
        setJob(data);
        console.log('Job loaded:', data);
      } catch (err) {
        setMessage('Unable to load job details.');
      } finally {
        setLoading(false);
      }
    };

    const loadProfile = async () => {
      if (user?.role === 'jobseeker') {
        try {
          const { data } = await fetchProfile();
          setProfile(data);
          console.log('Profile loaded for eligibility check:', data);
        } catch (err) {
          console.error('Error loading profile:', err);
          setProfile(null);
        }
      }
    };

    loadJob();
    loadProfile();
  }, [id, user]);

  useEffect(() => {
    const calculateEligibility = (profileData, jobData) => {
      console.log('Calculating eligibility...', { profile: profileData, job: jobData });
      
      if (!user) {
        return { eligible: false, reason: 'Log in as a job seeker to view application eligibility.' };
      }
      if (user.role !== 'jobseeker') {
        return { eligible: false, reason: 'Only job seekers can apply for this position.' };
      }
      if (!profileData) {
        return { eligible: false, reason: 'Complete your profile to check eligibility.' };
      }
      if (!profileData.resumePath) {
        return { eligible: false, reason: 'Please upload your resume to apply for this job.' };
      }
      
      const userSkills = (profileData.skills || []).map((skill) => skill.toLowerCase()).filter(Boolean);
      const requiredSkills = (jobData.skills || []).map((skill) => skill.toLowerCase()).filter(Boolean);
      
      if (requiredSkills.length > 0 && userSkills.length === 0) {
        return { eligible: false, reason: 'Missing skills: Please add your skills to your profile.' };
      }
      
      const missingSkill = requiredSkills.find((skill) => !userSkills.includes(skill));
      if (missingSkill) {
        return { eligible: false, reason: `Missing skill: ${missingSkill}. This position requires expertise in ${missingSkill}.` };
      }
      
      const requiredExperience = Number(jobData.experience || 0);
      const userExperience = Number(profileData.experience) || 0;
      if (requiredExperience > userExperience) {
        return { eligible: false, reason: `Less experience: You have ${userExperience} years, but this position requires ${requiredExperience}+ years of experience.` };
      }
      
      const requiredEducation = (jobData.education || '').trim();
      if (requiredEducation) {
        const normalizedRequired = requiredEducation.toLowerCase();
        const degreeMatch = (profileData.degree || '').toLowerCase().includes(normalizedRequired);
        const educationDetailsMatch = (profileData.educationDetails || '').toLowerCase().includes(normalizedRequired);
        const educationEntriesMatch = (profileData.education || []).some((entry) => {
          return [entry.degree, entry.specialization, entry.schoolName, entry.collegeName, entry.universityName]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedRequired));
        });
        if (!degreeMatch && !educationDetailsMatch && !educationEntriesMatch) {
          return { eligible: false, reason: `Education not matched: This position requires ${jobData.education}. Please update your profile with the required education details.` };
        }
      }
      
      console.log('Eligibility check passed - user is eligible');
      return { eligible: true, reason: '' };
    };

    if (job && profile) {
      setEligibility(calculateEligibility(profile, job));
    }
  }, [job, profile, user]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setMessage('');
    try {
      await applyJob(id);
      setMessage('Application submitted successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to apply.');
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await saveJob(id);
      setMessage('Job saved for later.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save this job.');
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-slate-400">Loading job details…</div>;
  }

  if (!job) {
    return <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-slate-400">Job not found.</div>;
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Job details</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{job.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{job.company} · {job.location}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user?.role === 'jobseeker' && (
            <button onClick={handleSave} className="rounded-full bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-amber-500/15">Save Job</button>
          )}
          {eligibility.eligible && user?.role === 'jobseeker' ? (
            <button onClick={handleApply} className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">Apply Now</button>
          ) : user?.role === 'jobseeker' ? (
            <div className="rounded-full bg-rose-500/10 px-5 py-3 text-sm text-rose-200 border border-rose-500/20">
              Not Eligible
            </div>
          ) : null}
        </div>
      </div>

      {message && <div className="rounded-3xl bg-amber-500/10 p-4 text-sm text-amber-100">{message}</div>}
      
      {!eligibility.eligible && user?.role === 'jobseeker' && eligibility.reason && (
        <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-6">
          <p className="font-semibold text-rose-200">You are not eligible for this job.</p>
          <p className="mt-2 text-sm text-rose-100/80">{eligibility.reason}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-xl font-semibold text-white">Job description</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{job.description}</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h3 className="text-lg font-semibold text-white">Skills required</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills?.map((skill) => (
                <span key={skill} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-200">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h3 className="text-lg font-semibold text-white">Details</h3>
            <div className="mt-5 space-y-4 text-slate-300">
              <div className="flex items-center gap-3">
                <IconMapPin size={18} /> <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <IconBriefcase size={18} /> <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <IconLink size={18} /> <span>{job.salary || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-3">
                <IconBriefcase size={18} /> <span>{job.experience ? `${job.experience}+ years experience` : 'No experience requirement'}</span>
              </div>
              {job.education && (
                <div className="flex items-center gap-3">
                  <IconBriefcase size={18} /> <span>{job.education}</span>
                </div>
              )}
              <div className="rounded-3xl bg-slate-950/90 p-4 text-slate-300">
                <p className="text-sm text-slate-400">Posted by</p>
                <p className="mt-2 text-sm text-white">{job.postedBy?.name || 'Recruiter'}</p>
                <p className="text-xs text-slate-500">{job.postedBy?.email}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Your next step</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">Use the filters in Explore to discover similar jobs and save your top matches for later.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

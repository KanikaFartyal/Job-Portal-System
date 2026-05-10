import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBuildingStore, IconCalendarTime, IconUsers, IconEye, IconX, IconRefresh } from '@tabler/icons-react';
import { fetchMyJobs, deleteJob, fetchApplicants } from '../api';

const PostedJobs = ({ user }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applicantsModal, setApplicantsModal] = useState({ open: false, job: null, applicants: [] });

  const loadJobs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const { data } = await fetchMyJobs();
      setJobs(data || []);
      setMessage('');
      setMessageType('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Unable to load your jobs.';
      setMessage(errorMessage);
      setMessageType('error');
      console.error('Error loading jobs:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      console.log('PostedJobs - User logged in, loading jobs. User:', user);
      loadJobs();
    }
  }, [user]);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteJob(jobId);
      setMessage('Job deleted successfully.');
      setMessageType('success');
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Delete failed';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  const handleViewApplicants = async (job) => {
    try {
      const { data } = await fetchApplicants(job._id);
      setApplicantsModal({ open: true, job, applicants: data || [] });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to load applicants.';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  if (!user) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-slate-400">Please login to view your posted jobs.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Employer dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Your Posted Jobs</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Manage the roles you have published and keep your listings current.</p>
          </div>
          <button onClick={() => loadJobs(true)} disabled={refreshing} className="rounded-full bg-amber-500/10 px-4 py-3 text-sm text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-50">
            <IconRefresh size={16} className={`inline mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-3xl p-4 text-sm ${messageType === 'success' ? 'bg-emerald-500/10 text-emerald-200' : messageType === 'error' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-100'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-400">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
            Loading your posted jobs…
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center text-slate-400">
          <p className="mb-4">No jobs posted yet.</p>
          <button onClick={() => navigate('/post-job')} className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
            Post Your First Job
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <article key={job._id} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-slate-900/95">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{job.type}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><IconBuildingStore size={14} /> {job.company} · {job.location}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Experience</p>
                      <p className="mt-2 text-white">{job.experience ? `${job.experience}+ years` : 'Not specified'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Salary</p>
                      <p className="mt-2 text-white">{job.salary || 'Not specified'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Posted</p>
                      <p className="mt-2 text-white">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                    {job.skills?.map((skill) => (
                      <span key={skill} className="rounded-full bg-amber-500/10 px-3 py-1">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <div className="rounded-3xl bg-slate-900/90 p-4 text-sm text-slate-300">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Applicants</p>
                    <p className="mt-2 text-white text-lg font-semibold">{job.applicants?.length || 0}</p>
                  </div>
                  <button onClick={() => navigate(`/posted-jobs/edit/${job._id}`)} className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-amber-400/30 hover:bg-amber-500/10">
                    Edit Job
                  </button>
                  <button onClick={() => handleViewApplicants(job)} className="rounded-full bg-amber-500/10 px-4 py-3 text-sm text-amber-200 transition hover:bg-amber-500/20">
                    <IconEye size={16} className="inline mr-2" /> Applicants
                  </button>
                  <button onClick={() => handleDelete(job._id)} className="rounded-full bg-rose-500/10 px-4 py-3 text-sm text-rose-200 transition hover:bg-rose-500/20">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      
      {/* Applicants Modal */}
      {applicantsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Applicants for {applicantsModal.job?.title}</h2>
                <p className="text-sm text-slate-400">{applicantsModal.applicants.length} applicants</p>
              </div>
              <button onClick={() => setApplicantsModal({ open: false, job: null, applicants: [] })} className="text-slate-400 hover:text-white">
                <IconX size={24} />
              </button>
            </div>
            {applicantsModal.applicants.length === 0 ? (
              <p className="text-slate-400">No applicants yet.</p>
            ) : (
              <div className="space-y-4">
                {applicantsModal.applicants.map((applicant) => (
                  <div key={applicant._id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{applicant.name}</h3>
                        <p className="text-sm text-slate-400">{applicant.email}</p>
                        {applicant.phone && <p className="text-sm text-slate-400">{applicant.phone}</p>}
                      </div>
                      {applicant.resumePath && (
                        <a href={applicant.resumePath} target="_blank" rel="noopener noreferrer" className="rounded-full bg-amber-500/10 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-500/20">
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostedJobs;

import { useEffect, useState } from 'react';
import { IconClockHour4, IconBriefcase, IconUsers } from '@tabler/icons-react';
import { fetchAppliedJobs } from '../api';

const JobHistory = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchAppliedJobs()
      .then(({ data }) => setApplications(data))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-slate-400">Login to review your application history.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Application history</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Your recent job applications</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Review the roles you've applied to and keep track of your progress.</p>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-400">Loading your history…</div>
      ) : applications.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-400">You have not applied to any jobs yet.</div>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <article key={application._id} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-amber-400/30 hover:bg-slate-900/95">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <IconBriefcase size={18} />
                    <span className="font-semibold text-white">{application.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{application.company}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  <IconClockHour4 size={16} /> {new Date(application.createdAt).toLocaleDateString()}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobHistory;

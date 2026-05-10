import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IconBriefcase, IconHeart, IconChartLine, IconStar } from '@tabler/icons-react';
import { fetchStats } from '../api';

const statCards = [
  { title: 'Total Jobs', key: 'totalJobs', icon: IconBriefcase, gradient: 'from-sky-500 to-cyan-500' },
  { title: 'Total Applications', key: 'totalApplications', icon: IconHeart, gradient: 'from-amber-500 to-orange-500' },
  { title: 'Your Posted Jobs', key: 'postedJobs', icon: IconStar, gradient: 'from-violet-500 to-fuchsia-500' },
  { title: 'Your Applications', key: 'appliedJobs', icon: IconChartLine, gradient: 'from-emerald-500 to-teal-500' }
];

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchStats()
        .then(({ data }) => setStats(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-slate-400">Please login to view your dashboard.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back, {user.name}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Your latest profile and application insights are waiting below.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 px-6 py-4 text-sm text-slate-300 shadow-inner">
            <p className="text-slate-400">Career tip</p>
            <p className="mt-2">Update your profile regularly to get better job matches and recruiter attention.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {statCards.map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glow">
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${item.gradient} text-white`}>
              <item.icon size={24} />
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.24em] text-slate-400">{item.title}</p>
            <p className="mt-3 text-4xl font-semibold text-white">{loading ? '…' : stats?.[item.key] ?? 0}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Profile strength</p>
          <h2 className="mt-4 text-xl font-semibold text-white">Keep your profile complete</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">A detailed profile boosts your discoverability and matches on the platform.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Jobs filter</p>
          <h2 className="mt-4 text-xl font-semibold text-white">Refine your search</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Use location, skills, salary, and type filters for faster matching results.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Alerts</p>
          <h2 className="mt-4 text-xl font-semibold text-white">Watch your notifications</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Saved jobs and application updates will appear in your notification panel.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

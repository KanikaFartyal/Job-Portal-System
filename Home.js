import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconSearch, IconRocket, IconBuildingStore, IconTarget, IconSchool } from '@tabler/icons-react';

const Home = ({ user }) => {
  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">JobHook Portal</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Find your dream job with confidence.</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-400">Search thousands of roles, connect with modern recruiters, and build your profile in our sleek job seeker portal.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/jobs" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
                <IconSearch size={18} /> Find Jobs
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-100 transition hover:border-amber-300">
                <IconTarget size={18} /> Complete Profile
              </Link>
            </div>
          </div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl">
            <div className="absolute left-0 top-0 h-24 w-24 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="grid gap-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-inner">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Top role</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Software Engineer</h2>
                <p className="mt-2 text-slate-400">Google · New York · Remote</p>
              </div>
              <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <IconBuildingStore size={18} /> <span>4.8k companies hiring</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <IconRocket size={18} /> <span>Personalized roles based on your skills</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Search smarter', description: 'Filter jobs by skills, location, salary, and type.', icon: IconSearch },
          { title: 'Build profile', description: 'Add your education, experience, and resume to stand out.', icon: IconSchool },
          { title: 'Track offers', description: 'Receive notifications for jobs and application updates.', icon: IconRocket }
        ].map((item) => (
          <article key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-glow transition hover:-translate-y-1 hover:border-amber-400/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-300">
              <item.icon size={22} />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Home;

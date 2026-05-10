import { motion } from 'framer-motion';
import { IconMapPin, IconBuildingFactory2, IconUsers, IconHeart, IconExternalLink } from '@tabler/icons-react';

const JobCard = ({ job, onApply, onSave, onView, saved }) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="group rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-amber-300">{job.type}</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{job.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{job.company}</p>
        </div>
        <button onClick={onSave} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-amber-200 transition hover:border-amber-300 hover:bg-amber-500/10">
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
        {job.skills?.slice(0, 5).map((skill) => (
          <span key={skill} className="rounded-full bg-white/5 px-3 py-1">{skill}</span>
        ))}
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{job.description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <IconMapPin size={16} /> {job.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <IconUsers size={16} /> {job.applicants?.length || 0} applicants
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-2xl bg-slate-800/90 px-4 py-2 text-sm text-amber-300">{job.salary}</span>
        <div className="flex flex-wrap gap-3">
          <button onClick={onView} className="rounded-full bg-slate-900/90 px-4 py-2 text-sm text-white transition hover:bg-slate-800">
            <IconExternalLink size={16} className="inline-block mr-2" /> Details
          </button>
          <button onClick={onApply} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
            Apply Now
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default JobCard;

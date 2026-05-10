import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconBriefcase, IconMapPin, IconBuildingStore } from '@tabler/icons-react';
import { fetchJobs } from '../api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ title: '', location: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data } = await fetchJobs({ search: filters.title, location: filters.location, company: filters.company, page });
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters, page]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const pageCount = useMemo(() => Math.ceil(total / 10), [total]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Explore jobs</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Search roles by title, company, or location.</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="sr-only">Job title</span>
              <input
                name="title"
                value={filters.title}
                onChange={handleChange}
                placeholder="Job title"
                className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              />
            </label>
            <label className="block">
              <span className="sr-only">Location</span>
              <input
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              />
            </label>
            <label className="block">
              <span className="sr-only">Company</span>
              <input
                name="company"
                value={filters.company}
                onChange={handleChange}
                placeholder="Company"
                className="w-full rounded-3xl border border-white/10 bg-slate-900/85 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-400">Loading jobs…</div>
      ) : (
        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-400">No jobs found. Adjust your filters to explore more opportunities.</div>
          ) : (
            jobs.map((job) => (
              <Link
                key={job._id}
                to={`/job/${job._id}`}
                className="group rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-amber-400/30 hover:bg-slate-900/95"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <IconBriefcase size={18} />
                      <span className="font-medium text-slate-100">{job.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{job.company} · {job.location}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">{job.type || 'Full-time'}</div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{job.salary}</span>
                  {job.skills?.slice(0, 4).map((skill) => (
                    <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{skill}</span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`rounded-full px-4 py-2 text-sm transition ${pageNumber === page ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconBriefcase, IconLogout, IconUserCircle, IconMenu2, IconX } from '@tabler/icons-react';
import NotificationMenu from './NotificationMenu';

const Header = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRecruiter = ['employer', 'recruiter'].includes(user?.role);

  const recruiterNav = [
    { label: 'Home', path: '/' },
    { label: 'Post Job', path: '/post-job' },
    { label: 'Posted Jobs', path: '/posted-jobs' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
  ];

  const jobSeekerNav = [
    { label: 'Home', path: '/' },
    { label: 'Find Jobs', path: '/jobs' },
    { label: 'Job History', path: '/history' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
  ];

  const navLinks = isRecruiter ? recruiterNav : jobSeekerNav;
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-white transition hover:text-amber-300">
          <span className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-fuchsia-600 text-2xl shadow-glow">
            <IconBriefcase size={24} />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300">JobHook</p>
            <p className="text-xs text-slate-400">
              {isRecruiter ? 'Hiring made easy' : 'Modern career hub'}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden items-center gap-3 md:flex">
          <NotificationMenu />
          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 shadow-glow">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                {user.avatarPath ? (
                  <img src={user.avatarPath} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <IconUserCircle className="text-amber-300" size={20} />
                )}
              </span>
              <span className="min-w-[96px] text-sm text-slate-200">{user.name}</span>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-2 text-sm text-amber-200 transition hover:bg-amber-500/20 hover:text-amber-100"
              >
                <IconLogout size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-slate-900/95 backdrop-blur-xl md:hidden">
          <nav className="space-y-2 px-4 py-4 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-2 transition hover:bg-amber-500/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/10 px-4 py-4">
            {user ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-full bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

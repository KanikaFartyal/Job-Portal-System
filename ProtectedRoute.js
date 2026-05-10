import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, requiredRole, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = !requiredRole || (requiredRole === 'employer'
    ? ['employer', 'recruiter'].includes(user.role)
    : user.role === requiredRole);

  if (!isAuthorized) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-glow backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Access Denied</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Restricted Access</h1>
        <p className="mt-4 text-slate-400">
          Only {requiredRole === 'employer' ? 'recruiters/employers' : 'job seekers'} can access this feature.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Go Back Home
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

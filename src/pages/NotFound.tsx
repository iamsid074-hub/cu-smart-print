import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-black text-slate-900">404</h1>
        <p className="mb-6 text-xl text-slate-500 font-medium">Oops! Page not found</p>
        <a href="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-sm transition-all">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

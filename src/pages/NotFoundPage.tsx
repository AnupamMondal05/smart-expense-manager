import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <Logo />
      <h1 className="mt-8 text-6xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-lg text-slate-500">Page not found</p>
      <p className="mt-1 text-sm text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary mt-6">
        <Home className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}

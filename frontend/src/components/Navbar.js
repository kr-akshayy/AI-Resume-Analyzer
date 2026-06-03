'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" id="logo-link">
          <span className="navbar-logo-icon">🧠</span>
          <span>ResumeAI</span>
        </Link>

        <div className="navbar-nav">
          {user ? (
            <>
              <Link href="/dashboard" className="navbar-link" id="nav-dashboard">
                Dashboard
              </Link>
              <div className="navbar-user">
                <span className="navbar-avatar" id="nav-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleLogout}
                  id="nav-logout"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar-link" id="nav-login">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm" id="nav-register">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

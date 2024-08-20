import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Product Categorization System
          </Link>
          <div className="space-x-4">
            {session ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin">Admin</Link>
                )}
                {session.user.role === 'HUMAN_GRADER' && (
                  <Link href="/grading">Grading</Link>
                )}
                <button onClick={() => signOut()} className="text-white">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">Sign In</Link>
                <Link href="/auth/signup">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-200 p-4 text-center">
        <p>&copy; 2023 Product Categorization System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;

import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to Product Categorization System</h1>
        <p className="text-xl mb-6">
          Streamline your product management process with AI-powered categorization and human verification.
        </p>
        {session ? (
          <div>
            <p className="mb-4">Hello, {session.user?.name || session.user?.email}!</p>
            <p className="mb-4">
              You're signed in as a {session.user?.role}. Use the navigation menu to access your relevant sections.
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-4">
              Sign in to start categorizing products or managing the system.
            </p>
            <div className="space-x-4">
              <a href="/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Sign In
              </a>
              <a href="/auth/signup" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Sign Up
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;

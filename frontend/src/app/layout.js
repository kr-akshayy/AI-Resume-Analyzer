import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'ResumeAI — AI-Powered Resume Analyzer',
  description: 'Evaluate resumes against job descriptions with AI-powered analysis. Get match scores, section-wise breakdowns, rankings, and actionable feedback.',
  keywords: 'resume analyzer, AI, job matching, resume scoring, HR tech',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

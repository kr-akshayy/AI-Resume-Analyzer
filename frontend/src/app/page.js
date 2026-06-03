'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-content">
          <h1>
            Analyze Resumes with <br />
            <span className="gradient-text">AI Precision</span>
          </h1>
          <p>
            Upload resumes, match them against job descriptions, and get
            instant AI-powered insights with detailed scoring and actionable feedback.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg" id="hero-cta-dashboard">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary btn-lg" id="hero-cta-register">
                  Get Started Free →
                </Link>
                <Link href="/login" className="btn btn-secondary btn-lg" id="hero-cta-login">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Feature Cards */}
          <div className="hero-features">
            <div className="hero-feature animate-in-delay-1" id="feature-upload">
              <div className="hero-feature-icon">📄</div>
              <h3>Multi-Resume Upload</h3>
              <p>Upload and process multiple PDF & DOCX resumes simultaneously.</p>
            </div>

            <div className="hero-feature animate-in-delay-2" id="feature-ai">
              <div className="hero-feature-icon">🧠</div>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced AI extracts structured data and provides deep insights.</p>
            </div>

            <div className="hero-feature animate-in-delay-3" id="feature-scoring">
              <div className="hero-feature-icon">📊</div>
              <h3>Section-Wise Scoring</h3>
              <p>Detailed scoring for Skills, Experience, and Education sections.</p>
            </div>

            <div className="hero-feature animate-in-delay-1" id="feature-ranking">
              <div className="hero-feature-icon">🏆</div>
              <h3>Candidate Ranking</h3>
              <p>Automatically rank and compare multiple candidates at once.</p>
            </div>

            <div className="hero-feature animate-in-delay-2" id="feature-feedback">
              <div className="hero-feature-icon">💡</div>
              <h3>Smart Feedback</h3>
              <p>Get specific strengths, improvements, and actionable suggestions.</p>
            </div>

            <div className="hero-feature animate-in-delay-3" id="feature-embed">
              <div className="hero-feature-icon">🔗</div>
              <h3>Embedding Matching</h3>
              <p>Semantic similarity scoring using state-of-the-art embeddings.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import ResumeUploader from '@/components/ResumeUploader';
import ScoreCard from '@/components/ScoreCard';
import SectionScore from '@/components/SectionScore';
import RankingTable from '@/components/RankingTable';
import FeedbackPanel from '@/components/FeedbackPanel';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [files, setFiles] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Process state
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ step: '', percent: 0 });
  const [error, setError] = useState('');

  // Results
  const [results, setResults] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="page-container">
        <div className="loader">
          <div className="spinner" />
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please upload at least one resume');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setError('');
    setResults(null);
    setSelectedCandidate(null);

    try {
      // Step 1: Upload resumes
      setUploading(true);
      setProgress({ step: 'Uploading and parsing resumes...', percent: 20 });

      const uploadResult = await api.uploadResumes(files);
      const resumeIds = uploadResult.resumes
        .filter(r => !r.error)
        .map(r => r.id);

      if (resumeIds.length === 0) {
        throw new Error('Failed to parse any resumes. Please check the file formats.');
      }

      setUploading(false);

      // Step 1.5: Save job
      setProgress({ step: 'Saving job description...', percent: 30 });
      let jobId = null;
      try {
        const jobResult = await api.createJob(
          jobTitle || 'Untitled Job',
          jobDescription
        );
        jobId = jobResult.job.id;
      } catch (e) {
        // Non-critical
      }

      // Step 2: Analyze
      setAnalyzing(true);
      setProgress({ step: 'AI is analyzing resumes...', percent: 50 });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.percent >= 90) return prev;
          const steps = [
            'Extracting structured data...',
            'Computing embedding similarities...',
            'Scoring skills match...',
            'Evaluating experience relevance...',
            'Generating detailed feedback...',
            'Ranking candidates...'
          ];
          const nextPercent = Math.min(prev.percent + 8, 90);
          const stepIndex = Math.floor((nextPercent - 50) / 8);
          return {
            step: steps[stepIndex] || prev.step,
            percent: nextPercent
          };
        });
      }, 2000);

      const analysisResult = await api.analyzeResumes(
        resumeIds,
        jobDescription,
        jobId
      );

      clearInterval(progressInterval);
      setProgress({ step: 'Analysis complete!', percent: 100 });

      setResults(analysisResult);

      // Auto-select first candidate
      if (analysisResult.rankings?.length > 0) {
        const firstCandidate = analysisResult.results?.find(
          r => r.resumeId === analysisResult.rankings[0].resumeId
        );
        setSelectedCandidate(firstCandidate || analysisResult.results?.[0]);
      }

      // Reset progress after a brief delay
      setTimeout(() => {
        setAnalyzing(false);
        setProgress({ step: '', percent: 0 });
      }, 800);

    } catch (err) {
      setError(err.message || 'Analysis failed');
      setUploading(false);
      setAnalyzing(false);
      setProgress({ step: '', percent: 0 });
    }
  };

  const charCount = jobDescription.length;

  return (
    <div className="page-container" id="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="page-header animate-in">
          <h1>
            Resume <span className="gradient-text">Analyzer</span>
          </h1>
          <p>Upload resumes, enter a job description, and let AI do the matching.</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error" id="dashboard-error">
            ⚠️ {error}
            <button
              onClick={() => setError('')}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Analysis Progress Overlay */}
        {(uploading || analyzing) && (
          <div className="analysis-overlay" id="analysis-overlay">
            <div className="spinner" style={{ width: 64, height: 64 }} />
            <div className="analysis-progress">
              <h3 style={{ marginBottom: 'var(--space-2)' }}>
                {uploading ? 'Processing Resumes' : 'AI Analysis in Progress'}
              </h3>
              <p className="progress-step">{progress.step}</p>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-2)'
              }}>
                {progress.percent}% complete
              </p>
            </div>
          </div>
        )}

        {/* Input Section */}
        {!results && (
          <div className="dashboard-grid animate-in-delay-1">
            {/* Resume Upload */}
            <div className="dashboard-section" id="upload-section">
              <h3>📄 Upload Resumes</h3>
              <ResumeUploader files={files} setFiles={setFiles} />
            </div>

            {/* Job Description */}
            <div className="dashboard-section" id="jd-section">
              <h3>📋 Job Description</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  id="job-title"
                  className="form-input"
                  placeholder="e.g., Senior React Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="job-description">
                  Description
                  <span style={{
                    float: 'right',
                    color: charCount > 5000 ? 'var(--color-error)' : 'var(--color-text-muted)'
                  }}>
                    {charCount} / 5000
                  </span>
                </label>
                <textarea
                  id="job-description"
                  className="form-textarea"
                  placeholder="Paste the full job description here including requirements, responsibilities, qualifications..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                  rows={12}
                  style={{ minHeight: '240px' }}
                />
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleAnalyze}
                disabled={files.length === 0 || !jobDescription.trim() || uploading || analyzing}
                id="analyze-btn"
              >
                {uploading || analyzing ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    Analyzing...
                  </>
                ) : (
                  <>🚀 Analyze {files.length} Resume{files.length !== 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="animate-in" id="results-section">
            {/* Back / New Analysis */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-6)'
            }}>
              <div>
                <h2>Analysis Results</h2>
                <p style={{ fontSize: 'var(--text-sm)' }}>
                  {results.successCount} resume{results.successCount !== 1 ? 's' : ''} analyzed
                  {results.errorCount > 0 && ` • ${results.errorCount} failed`}
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setResults(null);
                  setSelectedCandidate(null);
                  setFiles([]);
                  setJobDescription('');
                  setJobTitle('');
                }}
                id="new-analysis-btn"
              >
                ✨ New Analysis
              </button>
            </div>

            {/* Rankings Table */}
            {results.rankings?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Candidate Rankings
                </h3>
                <RankingTable rankings={results.rankings} />
              </div>
            )}

            {/* Candidate Selector */}
            {results.results?.filter(r => !r.error).length > 0 && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  👤 Detailed Analysis
                </h3>

                {results.results.filter(r => !r.error).length > 1 && (
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-6)',
                    flexWrap: 'wrap'
                  }}>
                    {results.results.filter(r => !r.error).map((r) => (
                      <button
                        key={r.resumeId}
                        className={`btn ${selectedCandidate?.resumeId === r.resumeId ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setSelectedCandidate(r)}
                        id={`select-candidate-${r.resumeId}`}
                      >
                        {r.name || 'Unknown'}
                      </button>
                    ))}
                  </div>
                )}

                {selectedCandidate && (
                  <div>
                    {/* Score Overview */}
                    <div className="results-header">
                      <div className="glass-card" style={{ textAlign: 'center' }}>
                        <ScoreCard
                          score={selectedCandidate.scores?.overall || 0}
                          label="Match Score"
                        />
                        <div className={`tier-badge tier-${(selectedCandidate.scores?.fitLevel || 'poor').toLowerCase()}`}
                          style={{ marginTop: 'var(--space-2)' }}>
                          {selectedCandidate.scores?.fitLevel}
                        </div>
                      </div>

                      <div className="glass-card">
                        <h4 style={{ marginBottom: 'var(--space-4)' }}>Section Scores</h4>
                        <SectionScore
                          label="Skills"
                          icon="💻"
                          score={selectedCandidate.scores?.skills?.score || 0}
                        />
                        <SectionScore
                          label="Experience"
                          icon="💼"
                          score={selectedCandidate.scores?.experience?.score || 0}
                        />
                        <SectionScore
                          label="Education"
                          icon="🎓"
                          score={selectedCandidate.scores?.education?.score || 0}
                        />

                        <div style={{
                          marginTop: 'var(--space-4)',
                          padding: 'var(--space-3)',
                          background: 'var(--color-bg-glass)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Embedding Similarity</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-accent-primary)' }}>
                              {selectedCandidate.embeddingSimilarity || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    {(selectedCandidate.scores?.skills?.matchedSkills?.length > 0 ||
                      selectedCandidate.scores?.skills?.missingSkills?.length > 0) && (
                      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
                        <h4 style={{ marginBottom: 'var(--space-4)' }}>🔧 Skills Analysis</h4>

                        {selectedCandidate.scores?.skills?.matchedSkills?.length > 0 && (
                          <div style={{ marginBottom: 'var(--space-3)' }}>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                              ✅ Matched Skills
                            </p>
                            <div className="skill-tags">
                              {selectedCandidate.scores.skills.matchedSkills.map((skill, i) => (
                                <span key={i} className="skill-tag matched">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedCandidate.scores?.skills?.missingSkills?.length > 0 && (
                          <div style={{ marginBottom: 'var(--space-3)' }}>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                              ❌ Missing Skills
                            </p>
                            <div className="skill-tags">
                              {selectedCandidate.scores.skills.missingSkills.map((skill, i) => (
                                <span key={i} className="skill-tag missing">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedCandidate.scores?.skills?.additionalSkills?.length > 0 && (
                          <div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                              ➕ Additional Skills
                            </p>
                            <div className="skill-tags">
                              {selectedCandidate.scores.skills.additionalSkills.map((skill, i) => (
                                <span key={i} className="skill-tag additional">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback Panel */}
                    <FeedbackPanel feedback={selectedCandidate.feedback} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

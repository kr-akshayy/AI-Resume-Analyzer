'use client';

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  return (
    <div id="feedback-panel">
      {/* Overall Assessment */}
      {feedback.overallAssessment && (
        <div className="glass-card animate-in" style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Overall Assessment
          </h4>
          <p style={{ lineHeight: 1.7 }}>{feedback.overallAssessment}</p>
        </div>
      )}

      <div className="results-detail">
        {/* Strengths */}
        <div className="animate-in-delay-1">
          <div className="feedback-section">
            <h4 className="feedback-section-title" style={{ color: 'var(--color-success)' }}>
              💪 Strengths
            </h4>
            {feedback.strengths?.map((item, i) => (
              <div key={i} className="feedback-card strength">
                <div className="feedback-card-title">{item.title}</div>
                <div className="feedback-card-detail">{item.detail}</div>
                {item.category && (
                  <span className="feedback-card-action">
                    📂 {item.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="animate-in-delay-2">
          <div className="feedback-section">
            <h4 className="feedback-section-title" style={{ color: 'var(--color-warning)' }}>
              🎯 Areas for Improvement
            </h4>
            {feedback.improvements?.map((item, i) => (
              <div key={i} className="feedback-card improvement">
                <div className="feedback-card-title">{item.title}</div>
                <div className="feedback-card-detail">{item.detail}</div>
                {item.actionItem && (
                  <div className="feedback-card-action">
                    ✅ Action: {item.actionItem}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <div className="animate-in-delay-3" style={{ marginTop: 'var(--space-6)' }}>
          <div className="feedback-section">
            <h4 className="feedback-section-title" style={{ color: 'var(--color-accent-primary)' }}>
              💡 Suggestions
            </h4>
            <div className="grid-2">
              {feedback.suggestions.map((item, i) => (
                <div key={i} className="feedback-card suggestion">
                  <div className="feedback-card-title">{item.title}</div>
                  <div className="feedback-card-detail">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Tips */}
      {feedback.resumeTips && feedback.resumeTips.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div className="glass-card">
            <h4 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📝 Resume Tips
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {feedback.resumeTips.map((tip, i) => (
                <li key={i} style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--color-bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)'
                }}>
                  <span style={{ color: 'var(--color-accent-primary)', flexShrink: 0 }}>→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

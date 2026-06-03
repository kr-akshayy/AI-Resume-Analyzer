'use client';

export default function RankingTable({ rankings }) {
  if (!rankings || rankings.length === 0) return null;

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
  };

  const getTierClass = (tier) => {
    const t = tier?.toLowerCase();
    if (t === 'excellent') return 'tier-excellent';
    if (t === 'good') return 'tier-good';
    if (t === 'fair') return 'tier-fair';
    return 'tier-poor';
  };

  return (
    <div className="ranking-table-wrapper animate-in" id="ranking-table">
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate</th>
            <th>Overall</th>
            <th>Skills</th>
            <th>Experience</th>
            <th>Education</th>
            <th>Fit Level</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((candidate) => (
            <tr key={candidate.resumeId} id={`ranking-row-${candidate.rank}`}>
              <td>
                <span className={`rank-badge ${getRankClass(candidate.rank)}`}>
                  {candidate.rank}
                </span>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{candidate.name}</div>
                {candidate.email && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {candidate.email}
                  </div>
                )}
              </td>
              <td>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  {candidate.overallScore}
                </span>
              </td>
              <td>{candidate.skillsScore}</td>
              <td>{candidate.experienceScore}</td>
              <td>{candidate.educationScore}</td>
              <td>
                <span className={`tier-badge ${getTierClass(candidate.tier)}`}>
                  {candidate.tier === 'Excellent' && '⭐ '}
                  {candidate.tier}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

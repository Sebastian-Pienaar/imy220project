import React, { useState } from 'react';
import SearchInput from './SearchInput';
import { useProjects } from '../context/ProjectsContext';

/**
 * GlobalSearch
 * Provides unified search over users (name/id/email) and project check-ins (message, type, hashtags).
 */
const GlobalSearch = () => {
  const { searchUsers, searchCheckIns } = useProjects();
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [checkInResults, setCheckInResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeSearch = async () => {
    const q = query.trim();
    if (!q) { setUserResults([]); setCheckInResults([]); return; }
    setLoading(true); setError(null);
    try {
      const [usersRes, checkInsRes] = await Promise.all([
        searchUsers(q),
        searchCheckIns(q)
      ]);
      setUserResults(usersRes);
      setCheckInResults(checkInsRes);
    } catch(e){
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-search space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput placeholder="Search users or check-ins..." onSearch={setQuery} />
        </div>
        <button type="button" className="small-btn" onClick={executeSearch} disabled={loading}>Search</button>
      </div>
      {loading && <p className="text-xs text-ink/50">Searching...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {(userResults.length>0 || checkInResults.length>0 || (query && !loading)) && (
        <div className="results grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-ink/70 mb-1">Users ({userResults.length})</h3>
            <ul className="divide-y divide-line bg-surface rounded shadow">
              {userResults.length === 0 && <li className="p-2 text-xs text-ink/50">No matches.</li>}
              {userResults.map(u => (
                <li key={u.id} className="p-2 text-sm">
                  <span className="font-medium">{u.name}</span>
                  <span className="text-ink/50 ml-2">@{u.id}</span>
                  {u.email && <span className="block text-ink/40 text-xs">{u.email}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink/70 mb-1">Check-ins ({checkInResults.length})</h3>
            <ul className="divide-y divide-line bg-surface rounded shadow">
              {checkInResults.length === 0 && <li className="p-2 text-xs text-ink/50">No matches.</li>}
              {checkInResults.map(ci => (
                <li key={ci.projectId + ci.ts} className="p-2 text-sm">
                  <div className="font-medium">{ci.projectName} <span className="text-ink/40">v{ci.version}</span></div>
                  <div className="text-xs text-ink/70">{ci.message}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[10px] tracking-wide uppercase">{ci.projectType}</span>
                    {ci.hashtags.map(tag => (
                      <span key={tag} className="px-1 py-0.5 bg-ink/5 text-ink/60 rounded text-[10px]">{tag}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

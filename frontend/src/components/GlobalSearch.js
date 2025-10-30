import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchInput from './SearchInput';
import { useProjects } from '../context/ProjectsContext';


const GlobalSearch = () => {
  const { users, projects } = useProjects();
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [projectResults, setProjectResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const executeSearch = async () => {
    const q = query.trim().toLowerCase();
    if (!q) { 
      setUserResults([]); 
      setProjectResults([]); 
      return; 
    }
    
    setLoading(true);
    

    const matchedUsers = users.filter(u => 
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
    
    
    const matchedProjects = projects.filter(p => 
      p.name?.toLowerCase().includes(q) ||
      (p.hashtags || []).some(tag => tag.toLowerCase().includes(q)) ||
      p.description?.toLowerCase().includes(q)
    );
    
    setUserResults(matchedUsers);
    setProjectResults(matchedProjects);
    setLoading(false);
  };

  return (
    <div className="global-search space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput 
            placeholder="Search users or projects..." 
            onSearch={setQuery} 
          />
        </div>
        <button 
          type="button" 
          className="small-btn" 
          onClick={executeSearch} 
          disabled={loading}
        >
          Search
        </button>
      </div>
      {loading && <p className="text-xs text-neutral-400">Searching...</p>}
      {(userResults.length>0 || projectResults.length>0 || (query && !loading)) && (
        <div className="results grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 mb-1">Users ({userResults.length})</h3>
            <ul className="divide-y divide-neutral-700 bg-neutral-800/60 border border-neutral-700 rounded-xl shadow max-h-64 overflow-y-auto">
              {userResults.length === 0 && <li className="p-2 text-xs text-neutral-400">No matches.</li>}
              {userResults.map(u => (
                <li key={u.id} className="hover:bg-neutral-800/50 transition-colors">
                  <Link 
                    to={`/profile/${u.id}`}
                    className="block p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                        {u.profileImage ? (
                          <img 
                            src={u.profileImage} 
                            alt={u.name} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-lg">{u.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{u.name}</p>
                        <p className="text-xs text-neutral-400 truncate">@{u.username || u.id}</p>
                        {u.role && <p className="text-xs text-neutral-500 truncate">{u.role}</p>}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 mb-1">Projects ({projectResults.length})</h3>
            <ul className="divide-y divide-neutral-700 bg-neutral-800/60 border border-neutral-700 rounded-xl shadow max-h-64 overflow-y-auto">
              {projectResults.length === 0 && <li className="p-2 text-xs text-neutral-400">No matches.</li>}
              {projectResults.map(p => (
                <li key={p.id} className="hover:bg-neutral-800/50 transition-colors">
                  <Link 
                    to={`/project/${p.id}`}
                    className="block p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-neutral-400 truncate">{p.description}</p>
                        )}
                        {p.hashtags && p.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.hashtags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[10px]">
                                {tag}
                              </span>
                            ))}
                            {p.hashtags.length > 3 && (
                              <span className="text-[10px] text-neutral-500">+{p.hashtags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xl ${p.isAvailable ? '✅' : '🔒'}`}>
                          {p.isAvailable ? '✅' : '🔒'}
                        </span>
                      </div>
                    </div>
                  </Link>
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

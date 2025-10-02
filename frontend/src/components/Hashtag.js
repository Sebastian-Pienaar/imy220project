import React from 'react';
import { useProjects } from '../context/ProjectsContext';

const Hashtag = ({ tag }) => {
  const { setActiveHashtag } = useProjects();
  if (!tag) return null;
  return (
    <button
      type="button"
      className="hashtag"
      onClick={() => setActiveHashtag(tag.toLowerCase())}
      aria-label={`Filter by ${tag}`}
    >{tag}</button>
  );
};

export default Hashtag;

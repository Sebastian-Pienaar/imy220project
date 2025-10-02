import React from 'react';

/**
 * TagCloud: visualizes frequency of user's favourite programming languages.
 * props: languages: string[] (may contain duplicates to indicate preference)
 */
const TagCloud = ({ languages = [] }) => {
  if (!languages.length) return <div className="tag-cloud empty">No languages added yet.</div>;
  const freq = languages.reduce((acc, lang) => { acc[lang] = (acc[lang]||0)+1; return acc; }, {});
  const entries = Object.entries(freq).sort((a,b)=> b[1]-a[1]);
  const counts = entries.map(e=>e[1]);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const range = max - min || 1;

  return (
    <div className="tag-cloud" aria-label="Favourite programming languages tag cloud">
      {entries.map(([lang,count]) => {
        const weight = (count - min) / range; // 0..1
        const fontSize = 0.85 + weight * 1.15; // rem scale
        const opacity = 0.55 + weight * 0.45;
        const hue = 210 - weight * 140; // blue->green
        return (
          <span
            key={lang}
            className="tag-cloud-item"
            style={{ fontSize: fontSize + 'rem', opacity, color: `hsl(${hue} 65% 40%)` }}
            title={`${lang} (${count})`}
          >{lang}</span>
        );
      })}
    </div>
  );
};

export default TagCloud;

import React from 'react';

/**
 * Reusable search input (stub) for filtering projects / users.
 * Props:
 *  - placeholder
 *  - onSearch(query)
 */
const SearchInput = ({ placeholder = 'Search...', onSearch, onEnter }) => {
  const [value, setValue] = React.useState('');

  const handleChange = (e) => {
    const newVal = e.target.value;
    setValue(newVal);
    // We still expose current value upward so parent can store it,
    // but actual search execution is now triggered explicitly by a button.
    onSearch?.(newVal);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter(value);
    }
  };

  return (
    <div className="search-input-wrapper">
      <input
        type="search"
        className="search-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search"
      />
    </div>
  );
};

export default SearchInput;

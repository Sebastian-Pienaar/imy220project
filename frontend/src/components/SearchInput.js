
import React from 'react';


const SearchInput = ({ placeholder = 'Search...', onSearch, onEnter }) => {
  const [value, setValue] = React.useState('');

  const handleChange = (e) => {
    const newVal = e.target.value;
    setValue(newVal);

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

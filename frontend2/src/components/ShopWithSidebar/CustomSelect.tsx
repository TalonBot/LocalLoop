import React, { useState, useEffect, useRef } from "react";

const CustomSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Find the selected option based on value
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  // Function to close the dropdown when a click occurs outside the component
  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    if (onChange) onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options
          .filter((option) => option.value !== selectedOption.value)
          .map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`select-item ${
                selectedOption.value === option.value ? "same-as-selected" : ""
              }`}
            >
              {option.label}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CustomSelect;

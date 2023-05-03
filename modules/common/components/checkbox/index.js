import React from "react";

const Checkbox = ({ checked = false, onChange, label }) => {
  return (
    <button
      className="text-base-regular flex items-center gap-x-2"
      role="checkbox"
      type="button"
      aria-checked={checked}
      onClick={onChange}
    >
      <div
        role="checkbox"
        aria-checked={checked}
        className="border border-gray-900 w-5 h-5 flex items-center justify-center"
      >
        {checked ? "✓" : null}
      </div>
      <span>{label}</span>
    </button>
  );
};

export default Checkbox;

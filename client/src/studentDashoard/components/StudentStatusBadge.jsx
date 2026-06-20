import React from 'react';

const StudentStatusBadge = ({ marks }) => {
  const isHigh = marks >= 80;
  const color = isHigh
    ? 'bg-emerald-100 border-emerald-300'
    : 'bg-amber-100 border-amber-300';

  return (
    <span
      className={`inline-block h-3 w-3 rounded-full border ${color}`}
      aria-label="Performance status"
      title="Performance status"
    />
  );
};

export default StudentStatusBadge;

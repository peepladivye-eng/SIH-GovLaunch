import React from 'react';

export default function TierBadge({ registrationStatus }) {
  const getTierInfo = (status) => {
    switch (status) {
      case 'unregistered':
        return { label: 'Idea Stage', color: '#D97706', bg: '#FEF3C7' };
      case 'incorporated':
        return { label: 'DPIIT Pending', color: '#D97706', bg: '#FEF3C7' };
      case 'dpiit_recognized':
        return { label: 'DPIIT Recognized', color: '#059669', bg: '#D1FAE5' };
      default:
        return { label: 'Idea Stage', color: '#D97706', bg: '#FEF3C7' };
    }
  };

  const tier = getTierInfo(registrationStatus);

  return (
    <span 
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: tier.bg, 
        color: tier.color 
      }}
    >
      <span 
        className="badge-dot"
        style={{ backgroundColor: tier.color }}
      />
      {tier.label}
    </span>
  );
}
import React from 'react';

const statusColors = {
  open: 'success',
  published: 'success',
  submitted: 'warning',
  screening: 'info',
  eligible: 'success',
  under_evaluation: 'warning',
  shortlisted: 'success',
  contracted: 'success',
  rejected: 'danger',
  ineligible: 'neutral',
  draft: 'neutral',
};

const colorMap = {
  success: { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
  warning: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  danger: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  info: { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' },
  neutral: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
};

export default function StatusBadge({ status }) {
  const colorKey = statusColors[status] || 'neutral';
  const colors = colorMap[colorKey];

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}
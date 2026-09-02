import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function ProofOfDisclosure({ application }) {
  if (!application) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const truncatedHash = application.content_hash 
    ? application.content_hash.substring(0, 12) + '...'
    : 'N/A';

  return (
    <Card className="rounded-xl border-[--border] shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck size={18} className="text-[--gov-accent]" />
          Proof of Disclosure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-[--text-secondary]">
          Submitted: {formatDate(application.created_at || application.submitted_at)}
        </div>
        {application.content_hash && (
          <div className="text-xs font-mono text-gray-400">
            Hash: {truncatedHash}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
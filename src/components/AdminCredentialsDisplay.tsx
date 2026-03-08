'use client';

import { ADMIN_CREDENTIALS } from '@/config/adminCredentials';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function AdminCredentialsDisplay() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mt-8 p-6 bg-slate-100 rounded-lg border-2 border-slate-300">
      <h2 className="text-xl font-bold text-slate-900 mb-4">📋 Authorized Admin Accounts</h2>
      <div className="space-y-3">
        {ADMIN_CREDENTIALS.map((admin, idx) => (
          <div
            key={admin.id}
            className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{admin.fullName}</p>
                <p className="text-sm text-slate-600">
                  Email: <code className="bg-slate-100 px-2 py-1 rounded">{admin.email}</code>
                </p>
                <p className="text-sm text-slate-600">
                  Password: <code className="bg-slate-100 px-2 py-1 rounded">{admin.password}</code>
                </p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(`${admin.email} / ${admin.password}`, idx)
                }
                className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition"
                title="Copy credentials"
              >
                {copiedIndex === idx ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-4">
        ✓ All accounts have full access to all features in the system.
      </p>
    </div>
  );
}

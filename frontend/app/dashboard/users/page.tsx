'use client';

import Link from 'next/link';
import { users } from '@/data/mock/users';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

export default function UsersPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Internal Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          {users.length} developers across all teams
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/dashboard/users/${user.id}`}
            className="bg-white rounded-lg p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Spend</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(user.monthlySpend)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Success</p>
                <p className="text-sm font-medium text-green-600">{formatPercent(user.successRate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Requests</p>
                <p className="text-sm font-medium text-gray-900">{user.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

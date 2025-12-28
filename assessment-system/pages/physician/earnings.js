import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function PhysicianEarnings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('physician_token');
    const storedUser = localStorage.getItem('physician');
    
    if (!token || !storedUser) {
      router.push('/physician/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchEarnings(token);
  }, []);

  const fetchEarnings = async (token) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/physician/earnings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('physician_token');
    localStorage.removeItem('physician');
    router.push('/physician/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>My Earnings | DuoDesire™</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-display hover:opacity-80 transition-opacity inline-block">
              <span className="text-gray-900">Duo</span>
              <span className="text-primary-500">Desire</span>
              <span className="text-primary-500 text-sm">™</span>
            </Link>
            <p className="text-sm text-gray-500">Earnings Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/physician/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
            <div className="text-right">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-3xl font-semibold text-green-600">
                  {formatCurrency(earnings?.totalEarnings)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-500">Pending Balance</p>
                <p className="text-3xl font-semibold text-yellow-600">
                  {formatCurrency(earnings?.pendingBalance)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-500">Paid Out</p>
                <p className="text-3xl font-semibold text-gray-600">
                  {formatCurrency(earnings?.paidOut)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-3xl font-semibold text-primary-600">
                  {earnings?.totalReviews || 0}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-2">Review Breakdown</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-green-600">{earnings?.approvedCount || 0}</p>
                    <p className="text-xs text-gray-400">Approved</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-red-600">{earnings?.deniedCount || 0}</p>
                    <p className="text-xs text-gray-400">Denied</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-2">Current Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(earnings?.feePerReview)} <span className="text-sm text-gray-400">per review</span>
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-2">This Month</p>
                <p className="text-2xl font-semibold text-primary-600">
                  {formatCurrency(earnings?.thisMonthEarnings)}
                </p>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              </div>

              {!earnings?.cycles || earnings.cycles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No payment cycles yet. Complete reviews to start earning!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Period</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reviews</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.cycles.map(cycle => (
                        <tr key={cycle.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {formatDateRange(cycle.startDate, cycle.endDate)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 capitalize">
                            {cycle.cycleType}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {cycle.totalReviews}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {formatCurrency(cycle.totalAmount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              cycle.status === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : cycle.status === 'closed'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {cycle.status === 'paid' ? 'Paid' : cycle.status === 'closed' ? 'Pending Payout' : 'Current'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {cycle.paidAt ? new Date(cycle.paidAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Review Payments</h2>
              </div>

              {!earnings?.recentPayments || earnings.recentPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No review payments yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Assessment</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Decision</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.recentPayments.map(payment => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm font-mono">
                            {payment.assessmentId.slice(0, 8)}...
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              payment.decision === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {payment.decision}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              payment.isPaid 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {payment.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


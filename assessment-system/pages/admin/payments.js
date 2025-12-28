import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminPayments() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [selectedPhysician, setSelectedPhysician] = useState('all');
  const [physicians, setPhysicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('physician_token');
    const storedUser = localStorage.getItem('physician');
    
    if (!token || !storedUser) {
      router.push('/physician/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      router.push('/physician/dashboard');
      return;
    }
    
    setUser(userData);
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    setIsLoading(true);
    try {
      const [cyclesRes, physiciansRes] = await Promise.all([
        fetch('/api/admin/payments/cycles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/physicians', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (cyclesRes.ok) {
        const data = await cyclesRes.json();
        setCycles(data.cycles || []);
      }

      if (physiciansRes.ok) {
        const data = await physiciansRes.json();
        setPhysicians(data.physicians?.filter(p => p.role !== 'admin') || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async (cycleId) => {
    setActionLoading(cycleId);
    try {
      const token = localStorage.getItem('physician_token');
      const response = await fetch('/api/admin/payments/mark-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cycleId }),
      });

      if (response.ok) {
        fetchData(token);
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('physician_token');
    localStorage.removeItem('physician');
    router.push('/physician/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  const filteredCycles = selectedPhysician === 'all' 
    ? cycles 
    : cycles.filter(c => c.physicianId === selectedPhysician);

  const totalUnpaid = filteredCycles
    .filter(c => c.status !== 'paid')
    .reduce((sum, c) => sum + c.totalAmount, 0);

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
        <title>Payment Management | DuoDesire™</title>
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
            <p className="text-sm text-gray-500">Payment Management</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Admin
            </Link>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500">Total Unpaid</p>
            <p className="text-3xl font-semibold text-red-600">{formatCurrency(totalUnpaid)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500">Open Cycles</p>
            <p className="text-3xl font-semibold text-yellow-600">
              {filteredCycles.filter(c => c.status === 'open').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500">Total Physicians</p>
            <p className="text-3xl font-semibold text-gray-900">{physicians.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Physician:</label>
            <select
              value={selectedPhysician}
              onChange={(e) => setSelectedPhysician(e.target.value)}
              className="form-input w-64"
            >
              <option value="all">All Physicians</option>
              {physicians.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cycles Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Payout Cycles</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredCycles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No payout cycles found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Physician</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Period</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reviews</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCycles.map(cycle => (
                    <tr key={cycle.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {cycle.physician?.name || 'Unknown'}
                      </td>
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
                          {cycle.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {cycle.status !== 'paid' && cycle.totalAmount > 0 && (
                          <button
                            onClick={() => handleMarkPaid(cycle.id)}
                            disabled={actionLoading === cycle.id}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                          >
                            {actionLoading === cycle.id ? '...' : 'Mark Paid'}
                          </button>
                        )}
                        {cycle.status === 'paid' && cycle.paidAt && (
                          <span className="text-xs text-gray-400">
                            Paid {new Date(cycle.paidAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


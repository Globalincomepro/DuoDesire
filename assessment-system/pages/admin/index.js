import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [physicians, setPhysicians] = useState([]);
  const [settings, setSettings] = useState({ defaultFeePerReview: 5, payoutCycleType: 'weekly' });
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
      const [physiciansRes, settingsRes] = await Promise.all([
        fetch('/api/admin/physicians', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (physiciansRes.ok) {
        const data = await physiciansRes.json();
        setPhysicians(data.physicians || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (physicianId) => {
    setActionLoading(physicianId);
    try {
      const token = localStorage.getItem('physician_token');
      const response = await fetch('/api/admin/physicians/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ physicianId }),
      });

      if (response.ok) {
        fetchData(token);
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (physicianId) => {
    setActionLoading(physicianId);
    try {
      const token = localStorage.getItem('physician_token');
      const response = await fetch('/api/admin/physicians/deny', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ physicianId }),
      });

      if (response.ok) {
        fetchData(token);
      }
    } catch (error) {
      console.error('Failed to deny:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateFee = async (physicianId, newFee) => {
    try {
      const token = localStorage.getItem('physician_token');
      await fetch('/api/admin/physicians/update-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ physicianId, feePerReview: parseFloat(newFee) }),
      });
      fetchData(token);
    } catch (error) {
      console.error('Failed to update fee:', error);
    }
  };

  const handleToggleActive = async (physicianId, isActive) => {
    setActionLoading(physicianId);
    try {
      const token = localStorage.getItem('physician_token');
      await fetch('/api/admin/physicians/toggle-active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ physicianId, isActive: !isActive }),
      });
      fetchData(token);
    } catch (error) {
      console.error('Failed to toggle active:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('physician_token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });
      if (response.ok) {
        setSettings({ ...settings, ...newSettings });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('physician_token');
    localStorage.removeItem('physician');
    router.push('/physician/login');
  };

  const pendingPhysicians = physicians.filter(p => p.status === 'pending');
  const approvedPhysicians = physicians.filter(p => p.status === 'approved' && p.role !== 'admin');

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
        <title>Admin Dashboard | DuoDesire™</title>
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
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/physician/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Physician Dashboard
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
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b">
            <nav className="flex">
              {[
                { id: 'pending', label: 'Pending Doctors', count: pendingPhysicians.length },
                { id: 'active', label: 'Active Doctors', count: approvedPhysicians.length },
                { id: 'settings', label: 'Settings', count: null },
                { id: 'payments', label: 'Payments', count: null },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                {/* Pending Doctors Tab */}
                {activeTab === 'pending' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Registrations</h2>
                    {pendingPhysicians.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No pending registrations</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingPhysicians.map(physician => (
                          <div key={physician.id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{physician.name}</h3>
                              <p className="text-sm text-gray-500">{physician.email}</p>
                              {physician.licenseNumber && (
                                <p className="text-sm text-gray-400">License: {physician.licenseNumber}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Registered: {new Date(physician.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(physician.id)}
                                disabled={actionLoading === physician.id}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                              >
                                {actionLoading === physician.id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleDeny(physician.id)}
                                disabled={actionLoading === physician.id}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                              >
                                {actionLoading === physician.id ? '...' : 'Deny'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Active Doctors Tab */}
                {activeTab === 'active' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Physicians</h2>
                    {approvedPhysicians.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No active physicians</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">License</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fee/Review</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvedPhysicians.map(physician => (
                              <tr key={physician.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{physician.name}</td>
                                <td className="py-3 px-4 text-gray-600">{physician.email}</td>
                                <td className="py-3 px-4 text-gray-600">{physician.licenseNumber || '-'}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-600">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      defaultValue={physician.feePerReview}
                                      onBlur={(e) => handleUpdateFee(physician.id, e.target.value)}
                                      className="w-20 px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    physician.isActive 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {physician.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => handleToggleActive(physician.id, physician.isActive)}
                                    disabled={actionLoading === physician.id}
                                    className={`px-3 py-1 text-sm rounded transition ${
                                      physician.isActive
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                  >
                                    {physician.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
                    <div className="max-w-md space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Fee Per Review ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={settings.defaultFeePerReview}
                          onChange={(e) => setSettings({ ...settings, defaultFeePerReview: parseFloat(e.target.value) })}
                          onBlur={() => handleUpdateSettings({ defaultFeePerReview: settings.defaultFeePerReview })}
                          className="form-input w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This is the default fee for new physicians. You can override per physician.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payout Cycle
                        </label>
                        <select
                          value={settings.payoutCycleType}
                          onChange={(e) => {
                            setSettings({ ...settings, payoutCycleType: e.target.value });
                            handleUpdateSettings({ payoutCycleType: e.target.value });
                          }}
                          className="form-input w-full"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          How often earnings are grouped for payout.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Management</h2>
                    <Link 
                      href="/admin/payments"
                      className="btn btn-primary inline-block"
                    >
                      Go to Payment Dashboard →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


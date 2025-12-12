import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PhysicianDashboard() {
  const router = useRouter();
  const [physician, setPhysician] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, denied: 0, shipped: 0, all: 0 });
  const [activeFilter, setActiveFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physician_token');
    const storedPhysician = localStorage.getItem('physician');
    
    if (!token || !storedPhysician) {
      router.push('/physician/login');
      return;
    }
    
    setPhysician(JSON.parse(storedPhysician));
    fetchQueue(token, 'pending');
  }, []);

  const fetchQueue = async (token, status) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/physician/queue?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('physician_token');
        localStorage.removeItem('physician');
        router.push('/physician/login');
        return;
      }
      
      const data = await response.json();
      setAssessments(data.assessments || []);
      setCounts(data.counts || {});
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    const token = localStorage.getItem('physician_token');
    fetchQueue(token, status);
  };

  const handleLogout = () => {
    localStorage.removeItem('physician_token');
    localStorage.removeItem('physician');
    router.push('/physician/login');
  };

  const viewAssessment = (id) => {
    router.push(`/physician/assessment/${id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getRiskBadgeClass = (riskSummary) => {
    if (riskSummary.disqualifiers > 0) return 'risk-badge disqualifier';
    if (riskSummary.cautions > 0) return 'risk-badge caution';
    return 'risk-badge clear';
  };

  const getRiskLabel = (riskSummary) => {
    if (riskSummary.disqualifiers > 0) return `${riskSummary.disqualifiers} Disqualifier${riskSummary.disqualifiers > 1 ? 's' : ''}`;
    if (riskSummary.cautions > 0) return `${riskSummary.cautions} Caution${riskSummary.cautions > 1 ? 's' : ''}`;
    return 'Clear';
  };

  if (!physician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Physician Dashboard | DuoDesire™</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display">
              <span className="text-gray-900">Duo</span>
              <span className="text-primary-500">Desire</span>
              <span className="text-primary-500 text-sm">™</span>
            </h1>
            <p className="text-sm text-gray-500">Physician Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{physician.name}</p>
              <p className="text-sm text-gray-500">{physician.role}</p>
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
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-primary-500 text-white">
                <h2 className="font-semibold">Assessment Queue</h2>
              </div>
              
              <div className="p-2">
                {[
                  { key: 'pending', label: 'Pending Review', color: 'bg-yellow-500' },
                  { key: 'approved', label: 'Approved', color: 'bg-green-500' },
                  { key: 'denied', label: 'Denied', color: 'bg-red-500' },
                  { key: 'shipped', label: 'Shipped', color: 'bg-blue-500' },
                  { key: 'all', label: 'All Assessments', color: 'bg-gray-500' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleFilterChange(item.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition ${
                      activeFilter === item.key
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                      {item.label}
                    </span>
                    <span className={`text-sm font-semibold ${
                      activeFilter === item.key ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                      {counts[item.key] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Submissions</span>
                  <span className="font-semibold">{counts.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">{counts.approved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Denied</span>
                  <span className="font-semibold text-red-600">{counts.denied}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeFilter === 'all' ? 'All Assessments' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Assessments`}
                </h2>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading assessments...</p>
                </div>
              ) : assessments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No {activeFilter} assessments</p>
                </div>
              ) : (
                <div className="divide-y">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      onClick={() => viewAssessment(assessment.id)}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {assessment.patientName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {assessment.patientEmail}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Submitted {formatDate(assessment.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={getRiskBadgeClass(assessment.riskSummary)}>
                            {getRiskLabel(assessment.riskSummary)}
                          </span>
                          <span className={`status-badge ${assessment.status}`}>
                            {assessment.status}
                          </span>
                        </div>
                      </div>
                      
                      {assessment.isAutoDisqualified && (
                        <div className="mt-3 flex items-center gap-2 text-red-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Auto-disqualified - contains critical contraindications</span>
                        </div>
                      )}
                      
                      {assessment.riskFlags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {assessment.riskFlags.slice(0, 3).map((flag, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded ${
                              flag.type === 'disqualifier' ? 'bg-red-100 text-red-700' :
                              flag.type === 'caution' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {flag.message}
                            </span>
                          ))}
                          {assessment.riskFlags.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                              +{assessment.riskFlags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


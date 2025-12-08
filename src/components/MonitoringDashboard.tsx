import { useEffect, useState } from 'react';
import { captureException, captureMessage } from '../lib/sentry';

interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  checks: Record<string, unknown>;
  response_time_ms?: number;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCalendars: number;
  totalTiles: number;
  errorRate: number;
  avgResponseTime: number;
}

export function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);

      // Load health check
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData);
      }

      // Load analytics (mock data for now)
      setAnalytics({
        totalUsers: 1250,
        activeUsers: 340,
        totalCalendars: 890,
        totalTiles: 12450,
        errorRate: 0.02,
        avgResponseTime: 245
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      captureException(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">System Monitoring</h1>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">System Monitoring</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading monitoring data: {error}</p>
            <button
              onClick={loadMonitoringData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <button
            onClick={loadMonitoringData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Health Status */}
        {health && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    health.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    health.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {health.status.toUpperCase()}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Overall Status</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{health.version}</p>
                  <p className="text-sm text-gray-600">Version</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {health.response_time_ms ? `${health.response_time_ms}ms` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Response Time</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(health.checks).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      value === 'healthy' || value === 'configured' ? 'bg-green-100 text-green-800' :
                      value === 'unhealthy' || value === 'not_configured' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {analytics && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{analytics.activeUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Active Users (24h)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{analytics.totalCalendars.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Calendars</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{analytics.totalTiles.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Tiles</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{(analytics.errorRate * 100).toFixed(2)}%</p>
                  <p className="text-sm text-gray-600">Error Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{analytics.avgResponseTime}ms</p>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.open('/api/health', '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Health Check
              </button>
              <button
                onClick={() => captureMessage('Manual test error from monitoring dashboard', 'warning')}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Test Error Logging
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ReportDetails({ reportId, onBack }) {
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/patient/reports/${reportId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setDetails(data.report);
        } else {
          setError(data.message || 'Failed to fetch details');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching report details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [reportId, user.token]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(`${API_BASE_URL}/patient/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${details.test_name || 'Report'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF securely.');
    } finally {
      setDownloading(false);
    }
  };

  const customChartData = useMemo(() => {
    if (!details?.abnormal_tests) return [];
    
    return details.abnormal_tests.map(test => {
      let min = 0, max = 0, hasRange = false;
      const val = parseFloat(test.value);
      
      if (test.referenceRange && test.referenceRange !== 'N/A') {
        const str = test.referenceRange.replace(/,/g, '');
        const minMaxMatch = str.match(/([\d.]+)\s*-\s*([\d.]+)/);
        const lessMatch = str.match(/<\s*([\d.]+)/);
        const greaterMatch = str.match(/>\s*([\d.]+)/);
        
        if (minMaxMatch) {
          min = parseFloat(minMaxMatch[1]);
          max = parseFloat(minMaxMatch[2]);
          hasRange = true;
        } else if (lessMatch) {
          min = 0;
          max = parseFloat(lessMatch[1]);
          hasRange = true;
        } else if (greaterMatch) {
          min = parseFloat(greaterMatch[1]);
          max = min + Math.abs(min) * 0.5; // Arbitrary visualization cap for '>'
          hasRange = true;
        }
      }
      if (!hasRange || isNaN(val)) return null;

      const rangeSpan = Math.abs(max - min) || Math.abs(min) || 10;
      // Visual bounds that pad slightly around the minimums and maximums
      const vizMin = Math.min(min, val) - rangeSpan * 0.2;
      const vizMax = Math.max(max, val) + rangeSpan * 0.2;
      const totalViz = vizMax - vizMin;

      const toPercent = (v) => Math.max(0, Math.min(100, ((v - vizMin) / totalViz) * 100));

      const safeLeft = toPercent(min);
      const safeRight = toPercent(max);
      const safeWidth = safeRight - safeLeft;
      
      const valPos = toPercent(val);
      
      let redLeft = 0;
      let redWidth = 0;
      
      // If abnormal above safe limit
      if (val > max) {
        redLeft = safeRight;
        redWidth = valPos - safeRight;
      } 
      // If abnormal below safe limit
      else if (val < min) {
        redLeft = valPos;
        redWidth = safeLeft - valPos;
      }

      return {
        ...test,
        val, min, max,
        safeLeft, safeWidth,
        redLeft, redWidth,
        valPos
      };
    }).filter(Boolean);
  }, [details]);

  const categorizedTests = useMemo(() => {
    if (!details?.tests) return {};
    const grouped = {};
    details.tests.forEach(test => {
      const cat = test.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(test);
    });
    return grouped;
  }, [details]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="large" color="white" text="Loading report details..." />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="text-center py-20 text-white">
        <p className="text-red-400 text-xl mb-4">{error || 'Report not found'}</p>
        <button onClick={onBack} className="text-blue-400 hover:underline">← Back to reports</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-gray-300 hover:text-white transition flex items-center gap-2"
        >
          ← Back to All Reports
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`px-6 py-2 rounded-lg font-bold text-white shadow-lg transition ${downloading ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
        >
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">{details.test_name}</h2>
        <p className="text-gray-300 text-lg">Report Date: {details.date ? new Date(details.date).toLocaleDateString() : 'N/A'}</p>
      </div>

      {customChartData && customChartData.length > 0 && (
        <div className="bg-red-900/30 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 mb-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
            ⚠️ Abnormal Results Detected
          </h3>
          
          <div className="mb-8 space-y-8 mt-4">
            {customChartData.map((data, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-5 border border-white/5 pb-8">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-white font-semibold">{data.testName}</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-red-400">{data.value} {data.unit}</span>
                    <div className="text-xs text-gray-400 mt-1">Safe Range: {data.referenceRange}</div>
                  </div>
                </div>
                
                {/* The Visual Chart Bar */}
                <div className="relative mt-4 mb-4">
                  {/* Val Label (Above the bar) */}
                  <div 
                    className="absolute bottom-full mb-1 flex flex-col items-center transform -translate-x-1/2 text-red-400 font-bold text-[11px] whitespace-nowrap z-20" 
                    style={{ left: `${data.valPos}%` }}
                  >
                    <span>{data.val}</span>
                    <svg className="w-2 h-2 mt-0.5 fill-current" viewBox="0 0 10 10"><polygon points="0,0 10,0 5,10"/></svg>
                  </div>

                  {/* The Bar */}
                  <div className="relative h-6 bg-gray-800 rounded-full w-full overflow-hidden shadow-inner">
                    {/* Safe Range (Green) */}
                    <div 
                      className="absolute top-0 bottom-0 bg-green-500/40" 
                      style={{ left: `${data.safeLeft}%`, width: `${data.safeWidth}%` }}
                    ></div>
                    
                    {/* Magnitude of Abnormality (Red extension) */}
                    <div 
                      className="absolute top-0 bottom-0 bg-red-500/80" 
                      style={{ left: `${data.redLeft}%`, width: `${data.redWidth}%` }}
                    ></div>
                    
                    {/* Actual Value Marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] z-10" 
                      style={{ left: `calc(${data.valPos}% - 2px)` }}
                    ></div>
                  </div>

                  {/* Min/Max Labels (Below the bar) */}
                  <div className="absolute top-full mt-1 w-full h-4 text-[10px] sm:text-[11px] font-medium text-gray-400">
                    <div className="absolute flex flex-col items-center transform -translate-x-1/2" style={{ left: `${data.safeLeft}%` }}>
                      <svg className="w-1.5 h-1.5 mb-0.5 fill-current text-green-500/60" viewBox="0 0 10 10"><polygon points="5,0 10,10 0,10"/></svg>
                      {data.min}
                    </div>
                    <div className="absolute flex flex-col items-center transform -translate-x-1/2" style={{ left: `${data.safeRight}%` }}>
                      <svg className="w-1.5 h-1.5 mb-0.5 fill-current text-green-500/60" viewBox="0 0 10 10"><polygon points="5,0 10,10 0,10"/></svg>
                      {data.max}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-200 border-collapse">
              <thead>
                <tr className="border-b border-red-500/30">
                  <th className="py-3 px-4 font-semibold">Test Name</th>
                  <th className="py-3 px-4 font-semibold">Value</th>
                  <th className="py-3 px-4 font-semibold hidden md:table-cell">Range</th>
                </tr>
              </thead>
              <tbody>
                {customChartData.map((test, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-red-300 font-medium">{test.testName}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {test.value} <span className="text-sm font-normal text-gray-400">{test.unit}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-400">{test.referenceRange || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {Object.keys(categorizedTests).length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-4">Detailed Test Results</h3>
          {Object.entries(categorizedTests).map(([category, tests]) => (
            <div key={category} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-white/10 py-3 px-6 border-b border-white/10">
                <h4 className="text-lg font-bold text-blue-200">{category}</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                  <thead className="bg-black/20 text-gray-400 text-sm">
                    <tr>
                      <th className="py-3 px-6 font-medium">Test</th>
                      <th className="py-3 px-6 font-medium">Result</th>
                      <th className="py-3 px-6 font-medium hidden md:table-cell">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test, i) => (
                      <tr 
                        key={i} 
                        className={`border-b border-white/5 last:border-0 ${test.abnormal ? 'bg-red-900/10' : 'hover:bg-white/5'}`}
                      >
                        <td className={`py-3 px-6 ${test.abnormal ? 'text-red-300 font-medium' : ''}`}>
                          {test.testName}
                        </td>
                        <td className={`py-3 px-6 ${test.abnormal ? 'text-red-400 font-bold' : 'text-white'}`}>
                          {test.value} <span className="text-xs text-gray-500 ml-1">{test.unit}</span>
                        </td>
                        <td className="py-3 px-6 hidden md:table-cell text-sm text-gray-500">
                          {test.referenceRange || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}

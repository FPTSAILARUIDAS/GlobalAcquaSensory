import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProficiencyTestDailySummary = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDailySummary();
  }, [date]);

  const fetchDailySummary = async () => {
    try {
      const storedAuth = localStorage.getItem("auth");
      let token = null;
      
      if (storedAuth) {
        try {
          const auth = JSON.parse(storedAuth);
          token = auth.token;
        } catch (e) {
          console.error("Failed to parse auth from localStorage");
        }
      }
      
      if (!token) {
        setMessage("Please login first to view daily summary");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API}/admin/daily-summary/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter ONLY proficiency tests
      const proficiencySessions = response.data.sessions.filter(s => 
        s.testType === "proficiency"
      );
      
      setSummaryData({
        ...response.data,
        sessions: proficiencySessions,
        totalSessions: proficiencySessions.length
      });
    } catch (error) {
      console.error("Failed to fetch daily summary:", error);
      if (error.response?.status === 401) {
        setMessage("Authentication failed. Please login again.");
      } else {
        setMessage(error.response?.data?.detail || "Failed to load summary data");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading summary...</p>
      </div>
    );
  }

  if (!summaryData || summaryData.totalSessions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-4 border-green-600 bg-white rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Global Acqua Pvt Ltd
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Sensory Quality Control
            </p>
            <h2 className="text-2xl font-semibold text-green-600 mb-3">
              Proficiency Test Summary Report
            </h2>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Date:</span>
              <span className="ml-2">{formatDate(date)}</span>
            </div>
          </div>

          {/* Date Navigation - ALWAYS SHOW */}
          <div className="mb-4 flex items-center justify-center space-x-4 bg-green-50 p-4 rounded-lg border border-green-200">
            <button
              onClick={() => {
                const currentDate = new Date(date);
                currentDate.setDate(currentDate.getDate() - 1);
                navigate(`/proficiency-test-summary/${currentDate.toISOString().split('T')[0]}`);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              ← Previous Day
            </button>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">Select Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => navigate(`/proficiency-test-summary/${e.target.value}`)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => {
                const currentDate = new Date(date);
                currentDate.setDate(currentDate.getDate() + 1);
                const today = new Date().toISOString().split('T')[0];
                const nextDay = currentDate.toISOString().split('T')[0];
                if (nextDay <= today) {
                  navigate(`/proficiency-test-summary/${nextDay}`);
                }
              }}
              disabled={date >= new Date().toISOString().split('T')[0]}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next Day →
            </button>
          </div>

          {/* No Data Message */}
          <div className="bg-white rounded-lg p-8 text-center shadow-md">
            <p className="text-lg text-gray-600">No Proficiency Test sessions found for {formatDate(date)}</p>
            <p className="text-sm text-gray-500 mt-2">Use the date navigation above to view other dates</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalPanelists = summaryData.sessions.reduce((sum, session) => sum + session.ballots.length, 0);
  
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Action Buttons */}
      <div className="no-print flex items-center justify-end space-x-3 mb-6">
        <Button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </Button>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-4 border-green-600">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Global Acqua Pvt Ltd
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Sensory Quality Control
          </p>
          <h2 className="text-2xl font-semibold text-green-600 mb-3">
            Proficiency Test Summary Report
          </h2>
          <div className="flex justify-between items-center text-sm text-gray-700 max-w-4xl mx-auto">
            <div>
              <span className="font-semibold">Date:</span>
              <span className="ml-2">{formatDate(date)}</span>
            </div>
            <div>
              <span className="font-semibold">Total Sessions:</span>
              <span className="ml-2">{summaryData.totalSessions}</span>
            </div>
            <div>
              <span className="font-semibold">Total Panelists:</span>
              <span className="ml-2">{totalPanelists}</span>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="mb-4 flex items-center justify-center space-x-4 no-print bg-green-50 p-4 rounded-lg border border-green-200">
          <button
            onClick={() => {
              const currentDate = new Date(date);
              currentDate.setDate(currentDate.getDate() - 1);
              navigate(`/proficiency-test-summary/${currentDate.toISOString().split('T')[0]}`);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            ← Previous Day
          </button>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-gray-700">Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => navigate(`/proficiency-test-summary/${e.target.value}`)}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => {
              const currentDate = new Date(date);
              currentDate.setDate(currentDate.getDate() + 1);
              const today = new Date().toISOString().split('T')[0];
              const nextDay = currentDate.toISOString().split('T')[0];
              if (nextDay <= today) {
                navigate(`/proficiency-test-summary/${nextDay}`);
              }
            }}
            disabled={date >= new Date().toISOString().split('T')[0]}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next Day →
          </button>
        </div>

        {/* Summary Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-2 border-gray-900" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">S.No</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Panelist Name</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Test Date</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Round No</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Sample Color Code</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Actual Off Note</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Actual IN/OUT</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Panelist Submission Off Notes</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Panelist IN/OUT</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Meets Requirement</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let rowCounter = 0;
                return summaryData.sessions.map((session, sessionIndex) => {
                  return session.ballots.map((ballot, ballotIndex) => {
                    const ballotStartRow = rowCounter + 1; // Store the starting row for this ballot
                    // For each ballot, show all samples
                    return ballot.samples && ballot.samples.map((sample, sampleIndex) => {
                      rowCounter++; // Increment for each row
                      const slNo = rowCounter;
                      const isControl = sample.colorCode === "Control";
                      const meetsRequirement = isControl || (sample.status === "IN" && sample.offNote && sample.offNote.trim() !== "");
                      
                      return (
                        <tr key={`${session.id}-${ballotIndex}-${sampleIndex}`} className={slNo % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border-2 border-gray-900 px-3 py-2 text-xs">{sampleIndex === 0 ? ballotStartRow : ""}</td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-xs">{sampleIndex === 0 ? ballot.panelistName : ""}</td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">{sampleIndex === 0 ? ballot.testDate : ""}</td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">{sampleIndex === 0 ? ballot.roundNo : ""}</td>
                        <td 
                          className="border-2 border-gray-900 px-3 py-2 text-xs font-semibold"
                          style={{
                            backgroundColor: sample.colorCode === "Yellow" ? "#fef08a" :
                                          sample.colorCode === "Brown" ? "#a16207" :
                                          sample.colorCode === "Blue" ? "#3b82f6" :
                                          sample.colorCode === "Green" ? "#22c55e" :
                                          sample.colorCode === "Red" ? "#ef4444" :
                                          sample.colorCode === "Purple" ? "#a855f7" :
                                          sample.colorCode === "White" ? "#ffffff" :
                                          sample.colorCode === "Black" ? "#000000" :
                                          sample.colorCode === "Control" ? "#e5e7eb" : "#ffffff",
                            color: sample.colorCode === "Brown" || sample.colorCode === "Blue" || sample.colorCode === "Red" || sample.colorCode === "Purple" || sample.colorCode === "Black" ? "#fff" : "#000",
                            border: sample.colorCode === "White" ? "2px solid #000" : ""
                          }}
                        >
                          {sample.colorCode}
                        </td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-xs">{isControl ? "N/A" : "-"}</td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                          {isControl ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">IN</span>
                          ) : "-"}
                        </td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-xs">{isControl ? "N/A" : (sample.offNote || "-")}</td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                          {isControl ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">IN (Control)</span>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              sample.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {sample.status}
                            </span>
                          )}
                        </td>
                        <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                          {isControl ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓</span>
                          ) : meetsRequirement ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓</span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">✗</span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                });
              }).flat().flat();
              })()} 
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p className="font-semibold">Generated by Global Acqua Pvt Ltd - Sensory Analysis System</p>
          <p className="mt-2">© {new Date().getFullYear()} Global Acqua Pvt Ltd. All rights reserved.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ProficiencyTestDailySummary;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DailySummarySheet = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  
  const [summaryData, setSummaryData] = useState(null);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [productFilter, setProductFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [verifyingSession, setVerifyingSession] = useState(null);
  const [verifierName, setVerifierName] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  useEffect(() => {
    fetchDailySummary();
  }, [date]);

  const fetchDailySummary = async () => {
    try {
      // Get token from localStorage (works in new tab/window)
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
      
      console.log("🔍 Daily Summary Debug:");
      console.log("  - Date:", date);
      console.log("  - Token exists:", !!token);
      console.log("  - API URL:", `${API}/admin/daily-summary/${date}`);
      
      if (!token) {
        console.error("❌ No authentication token found");
        setMessage("Please login first to view daily summary");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API}/admin/daily-summary/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("✅ API Response:", response.data);
      console.log("  - Total Sessions:", response.data.totalSessions);
      console.log("  - Sessions Array:", response.data.sessions);
      
      setSummaryData(response.data);
      setFilteredSessions(response.data.sessions);
    } catch (error) {
      console.error("❌ Failed to fetch daily summary:", error);
      console.error("  - Status:", error.response?.status);
      console.error("  - Data:", error.response?.data);
      
      if (error.response?.status === 401) {
        setMessage("Authentication failed. Please login again.");
      } else {
        setMessage(error.response?.data?.detail || "Failed to load summary data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifySession = async (sessionCode) => {
    if (!verifierName.trim()) {
      alert("Please enter your name (BSL)");
      return;
    }

    if (!signatureFile) {
      alert("Please upload your signature");
      return;
    }

    try {
      const storedAuth = localStorage.getItem("auth");
      let token = null;
      
      if (storedAuth) {
        try {
          const auth = JSON.parse(storedAuth);
          token = auth.token;
        } catch (e) {
          console.error("Failed to parse auth");
        }
      }
      
      if (!token) {
        alert("Please login first");
        return;
      }

      await axios.post(
        `${API}/admin/verify-session`,
        {
          sessionCode: sessionCode,
          verifiedByName: verifierName,
          signature: signaturePreview
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Session ${sessionCode} verified successfully!`);
      setVerifyingSession(null);
      setVerifierName("");
      setSignatureFile(null);
      setSignaturePreview(null);
      fetchDailySummary();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to verify session");
    }
  };

  const handleClearAllSessions = async () => {
    const sessionsToDelete = productFilter === "All" ? summaryData.sessions : filteredSessions;
    const filterText = productFilter === "All" ? "ALL" : `all ${productFilter}`;
    
    if (!window.confirm(`Are you sure you want to delete ${filterText} ${sessionsToDelete.length} session(s) for ${date}? This action cannot be undone!`)) {
      return;
    }

    try {
      const storedAuth = localStorage.getItem("auth");
      let token = null;
      
      if (storedAuth) {
        try {
          const auth = JSON.parse(storedAuth);
          token = auth.token;
        } catch (e) {
          console.error("Failed to parse auth");
        }
      }
      
      if (!token) {
        alert("Please login first");
        return;
      }

      // Delete filtered sessions
      for (const session of sessionsToDelete) {
        await axios.delete(
          `${API}/admin/sessions/${session.sessionCode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage(`${sessionsToDelete.length} session(s) deleted successfully!`);
      fetchDailySummary();
      setProductFilter("All");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to delete sessions");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter sessions by product type
  useEffect(() => {
    if (!summaryData) return;
    
    if (productFilter === "All") {
      setFilteredSessions(summaryData.sessions);
    } else {
      const filtered = summaryData.sessions.filter(session => {
        const firstBallot = session.ballots[0];
        if (!firstBallot) return false;
        
        const productType = firstBallot.productType === "Other" 
          ? firstBallot.otherProductType 
          : firstBallot.productType;
        
        return productType === productFilter;
      });
      setFilteredSessions(filtered);
    }
  }, [productFilter, summaryData]);

  // Get unique product types for filter
  const getProductTypes = () => {
    if (!summaryData) return [];
    
    const types = new Set(["All"]);
    summaryData.sessions.forEach(session => {
      const firstBallot = session.ballots[0];
      if (firstBallot) {
        const productType = firstBallot.productType === "Other" 
          ? firstBallot.otherProductType 
          : firstBallot.productType;
        types.add(productType);
      }
    });
    
    return Array.from(types);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Loading daily summary...</p>
    </div>;
  }

  if (!summaryData) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700 mb-2">No data available</p>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body, html {
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .min-h-screen {
            padding: 15px !important;
            margin: 0 !important;
            background: white !important;
          }
          
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 auto !important;
          }
          
          /* Header styles */
          h1 { 
            font-size: 26px !important; 
            margin-bottom: 6px !important; 
            font-weight: bold !important;
            color: #000 !important;
          }
          
          h2 { 
            font-size: 20px !important; 
            margin-bottom: 10px !important; 
            font-weight: 600 !important;
            color: #2563eb !important;
          }
          
          .text-lg {
            font-size: 16px !important;
            color: #000 !important;
          }
          
          .text-sm {
            font-size: 13px !important;
            color: #000 !important;
          }
          
          p {
            margin: 3px 0 !important;
            color: #000 !important;
          }
          
          .border-b-4 {
            margin-bottom: 15px !important;
            padding-bottom: 12px !important;
            border-bottom: 3px solid #2563eb !important;
          }
          
          /* Table styles */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: avoid !important;
            font-size: 11px !important;
            table-layout: fixed !important;
            background: white !important;
          }
          
          table th {
            background-color: #2563eb !important;
            color: white !important;
            font-weight: bold !important;
            padding: 6px 8px !important;
            font-size: 10px !important;
            line-height: 1.3 !important;
            border: 1.5px solid #000 !important;
            text-align: left !important;
          }
          
          table td {
            padding: 6px 8px !important;
            font-size: 10px !important;
            line-height: 1.4 !important;
            border: 1.5px solid #000 !important;
            vertical-align: middle !important;
            background: white !important;
            color: #000 !important;
          }
          
          /* Alternating row colors */
          tbody tr:nth-child(odd) td {
            background-color: #f9fafb !important;
          }
          
          tbody tr:nth-child(even) td {
            background-color: white !important;
          }
          
          /* Column widths */
          table th:nth-child(1), table td:nth-child(1) { width: 8% !important; }
          table th:nth-child(2), table td:nth-child(2) { width: 6% !important; }
          table th:nth-child(3), table td:nth-child(3) { width: 5% !important; }
          table th:nth-child(4), table td:nth-child(4) { width: 6% !important; }
          table th:nth-child(5), table td:nth-child(5) { width: 10% !important; }
          table th:nth-child(6), table td:nth-child(6) { width: 10% !important; }
          table th:nth-child(7), table td:nth-child(7) { width: 10% !important; }
          table th:nth-child(8), table td:nth-child(8) { width: 10% !important; }
          table th:nth-child(9), table td:nth-child(9) { width: 7% !important; }
          table th:nth-child(10), table td:nth-child(10) { width: 10% !important; }
          table th:nth-child(11), table td:nth-child(11) { width: 9% !important; }
          table th:nth-child(12), table td:nth-child(12) { width: 9% !important; }
          
          /* Badge styles */
          .px-3 {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          
          .py-1 {
            padding-top: 3px !important;
            padding-bottom: 3px !important;
          }
          
          .rounded-full {
            border-radius: 12px !important;
          }
          
          .text-xs {
            font-size: 10px !important;
          }
          
          .font-bold {
            font-weight: 700 !important;
          }
          
          .bg-green-200 {
            background-color: #bbf7d0 !important;
            border: 1.5px solid #15803d !important;
          }
          
          .text-green-900 {
            color: #15803d !important;
          }
          
          .bg-red-200 {
            background-color: #fecaca !important;
            border: 1.5px solid #991b1b !important;
          }
          
          .text-red-900 {
            color: #991b1b !important;
          }
          
          .text-orange-600 {
            color: #ea580c !important;
            font-weight: 600 !important;
          }
          
          .text-green-700 {
            color: #15803d !important;
            font-weight: 600 !important;
          }
          
          .text-gray-500, .text-gray-600 {
            color: #666 !important;
          }
          
          /* CRITICAL: Signature images - Force display */
          img[alt="Signature"] {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-width: 80px !important;
            max-height: 40px !important;
            width: auto !important;
            height: auto !important;
            margin: 0 auto !important;
            background: white !important;
            border: 1px solid #ccc !important;
            padding: 2px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ensure signature cell visibility */
          td:nth-child(12) {
            background: white !important;
            text-align: center !important;
          }
          
          /* Force all images to print */
          img {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Hide buttons and no-print elements */
          button, .no-print, .fixed {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Footer */
          .border-t-2 {
            margin-top: 25px !important;
            padding-top: 15px !important;
            border-top: 2px solid #000 !important;
          }
          
          .font-semibold {
            font-weight: 600 !important;
            color: #000 !important;
          }
          
          .mt-2 {
            margin-top: 6px !important;
          }
          
          .text-gray-700 {
            color: #333 !important;
          }
        }
      `}</style>
      
      {/* Action Buttons - Hide on print */}
      <div className="no-print fixed top-4 right-4 z-50 flex flex-wrap gap-2 justify-end">
        <Button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
        <Button
          onClick={handleClearAllSessions}
          className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
          disabled={!filteredSessions || filteredSessions.length === 0}
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear {productFilter !== "All" ? productFilter : "All"} ({filteredSessions?.length || 0})</span>
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
        <div className="text-center mb-6 pb-4 border-b-4 border-blue-600">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Global Acqua Pvt Ltd
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Sensory Quality Control
          </p>
          <h2 className="text-2xl font-semibold text-blue-600 mb-3">
            Daily Sensory Data Summary
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
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-gray-700">Filter by Product:</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getProductTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing: <span className="font-semibold">{filteredSessions.length}</span> of <span className="font-semibold">{summaryData.totalSessions}</span> sessions
          </div>
        </div>

        {/* Summary Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-2 border-gray-900" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Product</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Control Batch/Lot</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Time</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Sample Batch/Lot</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Sensory Done Date & Time</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Panelist 1</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Panelist 2</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Panelist 3</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Panel Result</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Next Step/Comments</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Verified By</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Digital Signature</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session, index) => {
                const firstBallot = session.ballots[0] || {};
                const lastBallot = session.ballots[session.ballots.length - 1] || {};
                
                // For blind/proficiency tests, check samples. For regular tests, check appearance/odour/taste
                const isBlindOrProficiencyTest = session.testType === "blind" || session.testType === "proficiency";
                let allPassed = false;
                
                if (isBlindOrProficiencyTest) {
                  // For blind/proficiency tests, check if all samples are "IN"
                  allPassed = session.ballots.every(ballot => 
                    ballot.samples && ballot.samples.every(sample => 
                      sample.colorCode === "Control" || sample.status === "IN"
                    )
                  );
                } else {
                  // For regular tests, check appearance/odour/taste with safety checks
                  allPassed = session.ballots.every(ballot => 
                    ballot.appearance?.status === "IN" && 
                    ballot.odour?.status === "IN" && 
                    (ballot.taste?.status === "IN" || ballot.productType === "Raw Water" || ballot.productType === "CIP Final Rinse Water")
                  );
                }
                
                const panelResult = allPassed ? "IN" : "OUT";
                const sensoryDoneDateTime = lastBallot.testingCompletionDate && lastBallot.testingCompletionTime 
                  ? `${lastBallot.testingCompletionDate} ${lastBallot.testingCompletionTime}`
                  : formatDate(session.completedAt);
                
                return (
                  <tr key={session.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                      {firstBallot.productType === "Other" ? firstBallot.otherProductType : firstBallot.productType}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                      {firstBallot.controlSampleCode || "-"}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                      {firstBallot.productTime || formatTime(session.createdAt)}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-mono">
                      {firstBallot.productCode}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                      {sensoryDoneDateTime}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                      {session.ballots[0]?.panelistName || "-"}
                      <br/>
                      <span className="text-xs text-gray-600">
                        {session.ballots[0] && (
                          isBlindOrProficiencyTest 
                            ? `${session.testType === "blind" ? "Blind Test" : "Proficiency Test"}` 
                            : `A:${session.ballots[0].appearance?.status || "N/A"} O:${session.ballots[0].odour?.status || "N/A"}${session.ballots[0].productType !== "Raw Water" && session.ballots[0].productType !== "CIP Final Rinse Water" ? ` T:${session.ballots[0].taste?.status || "N/A"}` : ""}`
                        )}
                      </span>
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                      {session.ballots[1]?.panelistName || "-"}
                      <br/>
                      {session.ballots[1] && <span className="text-xs text-gray-600">
                        {isBlindOrProficiencyTest 
                          ? `${session.testType === "blind" ? "Blind Test" : "Proficiency Test"}` 
                          : `A:${session.ballots[1].appearance?.status || "N/A"} O:${session.ballots[1].odour?.status || "N/A"}${session.ballots[1].productType !== "Raw Water" && session.ballots[1].productType !== "CIP Final Rinse Water" ? ` T:${session.ballots[1].taste?.status || "N/A"}` : ""}`
                        }
                      </span>}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                      {session.ballots[2]?.panelistName || "-"}
                      <br/>
                      {session.ballots[2] && <span className="text-xs text-gray-600">
                        A:{session.ballots[2].appearance.status} O:{session.ballots[2].odour.status}{session.ballots[2].productType !== "Raw Water" && session.ballots[2].productType !== "CIP Final Rinse Water" ? ` T:${session.ballots[2].taste.status}` : ""}
                      </span>}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        panelResult === "IN" 
                          ? "bg-green-200 text-green-900 border border-green-900" 
                          : "bg-red-200 text-red-900 border border-red-900"
                      }`}>
                        {panelResult}
                      </span>
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                      {session.ballots.map(b => b.remarks).filter(r => r).join("; ") || "-"}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                      {session.verifiedBy ? (
                        <div>
                          <p className="font-semibold text-green-700">{session.verifiedByName}</p>
                          <p className="text-xs text-gray-500">{formatDate(session.verificationTimestamp)}</p>
                        </div>
                      ) : (
                        <span className="text-orange-600 font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-center">
                      {session.verifiedBy && session.verificationSignature ? (
                        <img 
                          src={session.verificationSignature} 
                          alt="Signature" 
                          className="mx-auto"
                          style={{ maxWidth: '100px', maxHeight: '50px' }}
                        />
                      ) : (
                        <Button
                          onClick={() => setVerifyingSession(session.sessionCode)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 no-print"
                          size="sm"
                        >
                          Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Verification Modal */}
        {verifyingSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Verify Session: {verifyingSession}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name (BSL) *
                  </label>
                  <input
                    type="text"
                    value={verifierName}
                    onChange={(e) => setVerifierName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Signature *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {signaturePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img 
                        src={signaturePreview} 
                        alt="Signature preview" 
                        className="border-2 border-gray-300 rounded"
                        style={{ maxWidth: '200px', maxHeight: '100px' }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => handleVerifySession(verifyingSession)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Confirm Verification
                  </Button>
                  <Button
                    onClick={() => {
                      setVerifyingSession(null);
                      setVerifierName("");
                      setSignatureFile(null);
                      setSignaturePreview(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-900 text-sm text-gray-700">
          <p className="font-semibold">Generated by Global Acqua Pvt Ltd - Sensory Analysis System</p>
          <p className="mt-2">© {new Date().getFullYear()} Global Acqua Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default DailySummarySheet;

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, CheckCircle, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SignatureCanvas from 'react-signature-canvas';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DailySummarySheet = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  
  const [summaryData, setSummaryData] = useState(null);
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
      {/* Action Buttons - Hide on print */}
      <div className="no-print fixed top-4 right-4 z-50 flex space-x-2">
        <Button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
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
              {summaryData.sessions.map((session, index) => {
                const firstBallot = session.ballots[0] || {};
                const lastBallot = session.ballots[session.ballots.length - 1] || {};
                const allPassed = session.ballots.every(ballot => 
                  ballot.appearance.status === "IN" && 
                  ballot.odour.status === "IN" && 
                  (ballot.taste?.status === "IN" || ballot.productType === "Raw Water" || ballot.productType === "CIP Final Rinse Water")
                );
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
                        {session.ballots[0] && `A:${session.ballots[0].appearance.status} O:${session.ballots[0].odour.status}${session.ballots[0].productType !== "Raw Water" && session.ballots[0].productType !== "CIP Final Rinse Water" ? ` T:${session.ballots[0].taste.status}` : ""}`}
                      </span>
                    </td>
                    <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                      {session.ballots[1]?.panelistName || "-"}
                      <br/>
                      {session.ballots[1] && <span className="text-xs text-gray-600">
                        A:{session.ballots[1].appearance.status} O:{session.ballots[1].odour.status}{session.ballots[1].productType !== "Raw Water" && session.ballots[1].productType !== "CIP Final Rinse Water" ? ` T:${session.ballots[1].taste.status}` : ""}
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

        {/* Verification Section */}
        <div className="mt-8 border-t-2 border-gray-300 pt-6">
          {summaryData.verification ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-green-800">Verified by BSL</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Verified By:</p>
                  <p className="text-base text-gray-900">{summaryData.verification.verifiedByName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Verification Time:</p>
                  <p className="text-base text-gray-900">
                    {formatDate(summaryData.verification.verificationTimestamp)} at {formatTime(summaryData.verification.verificationTimestamp)}
                  </p>
                </div>
                {summaryData.verification.comments && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-700">Comments:</p>
                    <p className="text-base text-gray-900">{summaryData.verification.comments}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Digital Signature:</p>
                <img 
                  src={summaryData.verification.signature} 
                  alt="BSL Signature" 
                  className="border-2 border-gray-300 rounded bg-white"
                  style={{ maxWidth: '300px', maxHeight: '150px' }}
                />
              </div>
            </div>
          ) : (
            <div className="no-print">
              {!showSignature ? (
                <Button
                  onClick={() => setShowSignature(true)}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Verify Summary (BSL)</span>
                </Button>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">BSL Verification</h3>
                  
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
                        Digital Signature *
                      </label>
                      <div className="border-2 border-gray-300 rounded bg-white">
                        <SignatureCanvas
                          ref={signatureRef}
                          canvasProps={{
                            width: 500,
                            height: 200,
                            className: 'signature-canvas'
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => signatureRef.current.clear()}
                        variant="outline"
                        className="mt-2"
                        size="sm"
                      >
                        Clear Signature
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Comments (Optional)
                      </label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Any additional comments..."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleVerify}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirm Verification
                      </Button>
                      <Button
                        onClick={() => setShowSignature(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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

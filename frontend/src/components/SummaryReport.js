import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SummaryReport = () => {
  const { sessionCode } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [sessionCode]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`${API}/sessions/code/${sessionCode}`);
      setSession(response.data);
    } catch (error) {
      console.error("Failed to fetch session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
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

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getFinalConclusion = (ballot) => {
    const allIn = ballot.appearance.status === "IN" && 
                  ballot.odour.status === "IN" && 
                  ballot.taste.status === "IN";
    return allIn ? "ACCEPTED" : "REJECTED";
  };

  const getFailedTests = (ballot) => {
    const failed = [];
    if (ballot.appearance.status === "OUT") failed.push("Appearance");
    if (ballot.odour.status === "OUT") failed.push("Odour");
    if (ballot.taste.status === "OUT") failed.push("Taste");
    return failed.join(", ") || "-";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading report...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Session not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Action Buttons - Hide on print */}
      <div className="no-print fixed top-4 right-4 z-50 flex space-x-2">
        <Button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
        <Button
          onClick={() => window.close()}
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
        <div className="text-center mb-8 pb-6 border-b-4 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Global Acqua Pvt Ltd
          </h1>
          <p className="text-lg text-gray-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sensory Quality Control
          </p>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Sensory Analysis - Summary Report
          </h2>
          <div className="flex justify-between items-center text-sm text-gray-700 mt-4 max-w-4xl mx-auto">
            <div>
              <span className="font-semibold">Session Code:</span>
              <span className="ml-2 font-mono text-lg text-purple-700">{session.sessionCode}</span>
            </div>
            <div>
              <span className="font-semibold">Report Date:</span>
              <span className="ml-2">{formatDate(session.completedAt || session.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="mb-8">
          <table className="w-full border-2 border-gray-900" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border-2 border-gray-900 px-4 py-3 text-left font-bold text-sm">Panelist</th>
                <th className="border-2 border-gray-900 px-4 py-3 text-left font-bold text-sm">Product Code</th>
                <th className="border-2 border-gray-900 px-4 py-3 text-center font-bold text-sm">Appearance</th>
                <th className="border-2 border-gray-900 px-4 py-3 text-center font-bold text-sm">Odour</th>
                <th className="border-2 border-gray-900 px-4 py-3 text-center font-bold text-sm">Taste</th>
                <th className="border-2 border-gray-900 px-4 py-3 text-center font-bold text-sm">Final Conclusion</th>
                <th className="border-2 border-gray-900 px-4 py-3 text-left font-bold text-sm">Failed Tests</th>
                <th className="border-2 border-gray-900 px-4 py-3 text-center font-bold text-sm">Testing Date</th>
              </tr>
            </thead>
            <tbody>
              {session.ballots.map((ballot, index) => {
                const conclusion = getFinalConclusion(ballot);
                const isAccepted = conclusion === "ACCEPTED";
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border-2 border-gray-900 px-4 py-3 font-semibold text-gray-900">
                      {ballot.panelistName || `Panelist ${index + 1}`}
                    </td>
                    <td className="border-2 border-gray-900 px-4 py-3 text-gray-800 font-mono text-sm">
                      {ballot.productCode}
                    </td>
                    <td className="border-2 border-gray-900 px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ballot.appearance.status === "IN" 
                          ? "bg-green-200 text-green-900 border border-green-900" 
                          : "bg-red-200 text-red-900 border border-red-900"
                      }`}>
                        {ballot.appearance.status}
                      </span>
                    </td>
                    <td className="border-2 border-gray-900 px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ballot.odour.status === "IN" 
                          ? "bg-green-200 text-green-900 border border-green-900" 
                          : "bg-red-200 text-red-900 border border-red-900"
                      }`}>
                        {ballot.odour.status}
                      </span>
                    </td>
                    <td className="border-2 border-gray-900 px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ballot.taste.status === "IN" 
                          ? "bg-green-200 text-green-900 border border-green-900" 
                          : "bg-red-200 text-red-900 border border-red-900"
                      }`}>
                        {ballot.taste.status}
                      </span>
                    </td>
                    <td className="border-2 border-gray-900 px-4 py-3 text-center">
                      <span className={`px-4 py-2 rounded-lg text-sm font-black ${
                        isAccepted 
                          ? "bg-green-500 text-white border-2 border-green-900 shadow-lg" 
                          : "bg-red-500 text-white border-2 border-red-900 shadow-lg"
                      }`}>
                        {conclusion}
                      </span>
                    </td>
                    <td className="border-2 border-gray-900 px-4 py-3 text-sm text-gray-800">
                      {getFailedTests(ballot)}
                    </td>
                    <td className="border-2 border-gray-900 px-4 py-3 text-center text-sm text-gray-800">
                      {formatDate(ballot.testingCompletionDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Product Details Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Product Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Product Type:</p>
              <p className="text-base text-gray-900">
                {session.ballots[0]?.productType === "Other" 
                  ? session.ballots[0]?.otherProductType 
                  : session.ballots[0]?.productType}
              </p>
            </div>
            {session.ballots[0]?.productVariant && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Product Variant:</p>
                <p className="text-base text-gray-900">
                  {session.ballots[0]?.productVariant === "Other" 
                    ? session.ballots[0]?.otherProductVariant 
                    : session.ballots[0]?.productVariant}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-700">Date of Manufacturing:</p>
              <p className="text-base text-gray-900">{session.ballots[0]?.dateOfMfg}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Control Sample Code:</p>
              <p className="text-base text-gray-900">{session.ballots[0]?.controlSampleCode}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Legend:</h3>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-900 border border-green-900">IN</span>
              <span className="text-sm text-gray-700">= Within acceptable limits</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-200 text-red-900 border border-red-900">OUT</span>
              <span className="text-sm text-gray-700">= Outside acceptable limits</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-4 py-2 rounded-lg text-sm font-black bg-green-500 text-white border-2 border-green-900">ACCEPTED</span>
              <span className="text-sm text-gray-700">= All tests passed</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-4 py-2 rounded-lg text-sm font-black bg-red-500 text-white border-2 border-red-900">REJECTED</span>
              <span className="text-sm text-gray-700">= One or more tests failed</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-900 text-center">
          <p className="text-base font-bold text-gray-900">Generated by Global Acqua Pvt Ltd - Sensory Analysis System</p>
          <p className="text-sm text-gray-700 mt-2">© {new Date().getFullYear()} Global Acqua Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PrintableReport = () => {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="min-h-screen bg-white">
      {/* Action Buttons - Hide on print */}
      <div className="no-print fixed top-4 right-4 flex space-x-2 z-50">
        <Button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </Button>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto p-12">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-4 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Global Acqua Pvt Ltd
          </h1>
          <p className="text-lg text-gray-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sensory Quality Control
          </p>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Sensory Analysis Report
          </h2>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
            <div>
              <span className="font-semibold">Session Code:</span>
              <span className="ml-2 font-mono text-lg text-purple-700">{session.sessionCode}</span>
            </div>
            <div>
              <span className="font-semibold">Date:</span>
              <span className="ml-2">{formatDate(session.completedAt || session.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Panelist Results */}
        <div className="space-y-8">
          {session.ballots.map((ballot, index) => {
            const isBlindOrProficiencyTest = ballot.samples && Array.isArray(ballot.samples);
            
            // Get background color for each sample code
            const getColorStyle = (colorCode) => {
              const colorMap = {
                "Control": { backgroundColor: "#e5e7eb", color: "#000" },
                "Yellow": { backgroundColor: "#fef08a", color: "#000" },
                "Brown": { backgroundColor: "#a16207", color: "#fff" },
                "Blue": { backgroundColor: "#3b82f6", color: "#fff" },
                "Green": { backgroundColor: "#22c55e", color: "#000" },
                "Red": { backgroundColor: "#ef4444", color: "#fff" },
                "Purple": { backgroundColor: "#a855f7", color: "#fff" },
                "White": { backgroundColor: "#ffffff", color: "#000", border: "2px solid #000" },
                "Black": { backgroundColor: "#000000", color: "#fff" },
              };
              return colorMap[colorCode] || {};
            };
            
            // For blind test or proficiency test, render different format
            if (isBlindOrProficiencyTest) {
              return (
                <div key={index} className="border-2 border-gray-300 rounded-lg p-6 break-inside-avoid">
                  <div className="bg-purple-50 -m-6 mb-4 p-4 rounded-t-lg border-b-2 border-purple-200">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Panelist {index + 1}: {ballot.panelistName || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Test Date: {ballot.testDate} | Round No: {ballot.roundNo}
                    </p>
                  </div>

                  {/* Sample Results Table */}
                  <table className="w-full border-collapse border-2 border-gray-300 mt-4">
                    <thead>
                      <tr className="bg-purple-600 text-white">
                        <th className="border-2 border-gray-300 px-4 py-2 text-left font-bold">Sl No</th>
                        <th className="border-2 border-gray-300 px-4 py-2 text-left font-bold">Sample Color Code</th>
                        <th className="border-2 border-gray-300 px-4 py-2 text-center font-bold">IN/OUT</th>
                        <th className="border-2 border-gray-300 px-4 py-2 text-left font-bold">OFF Note Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ballot.samples.map((sample, sIdx) => (
                        <tr key={sIdx}>
                          <td className="border-2 border-gray-300 px-4 py-2">
                            {sample.colorCode === "Control" ? "Control" : sIdx}
                          </td>
                          <td className="border-2 border-gray-300 px-4 py-2 font-semibold" style={getColorStyle(sample.colorCode)}>
                            {sample.colorCode}
                          </td>
                          <td className="border-2 border-gray-300 px-4 py-2 text-center">
                            {sample.colorCode === "Control" ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                IN (Control)
                              </span>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                sample.status === "IN" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {sample.status}
                              </span>
                            )}
                          </td>
                          <td className="border-2 border-gray-300 px-4 py-2 text-sm">
                            {sample.colorCode === "Control" ? "N/A" : (sample.offNote || "-")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Signature */}
                  {ballot.signature && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Signature:</p>
                      <img 
                        src={ballot.signature} 
                        alt="Signature" 
                        className="max-w-xs h-20 border-2 border-purple-300 rounded-lg object-contain bg-white p-2"
                      />
                    </div>
                  )}
                </div>
              );
            }
            
            // Regular sensory test format
            return (
            <div key={index} className="border-2 border-gray-300 rounded-lg p-6 break-inside-avoid">
              <div className="bg-blue-50 -m-6 mb-4 p-4 rounded-t-lg border-b-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Panelist {index + 1}: {ballot.panelistName || "Unknown"}
                </h3>
              </div>

              {/* Product Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                  Product Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Product Type</p>
                    <p className="text-sm text-gray-900">{ballot.productType === "Other" ? ballot.otherProductType : ballot.productType}</p>
                  </div>
                  {ballot.productVariant && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Product Variant</p>
                      <p className="text-sm text-gray-900">{ballot.productVariant === "Other" ? ballot.otherProductVariant : ballot.productVariant}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Product Code</p>
                    <p className="text-sm text-gray-900">{ballot.productCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Date of Manufacturing</p>
                    <p className="text-sm text-gray-900">{ballot.dateOfMfg}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Control Sample Code</p>
                    <p className="text-sm text-gray-900">{ballot.controlSampleCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Product Time</p>
                    <p className="text-sm text-gray-900">{ballot.productTime}</p>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                  Sensory Test Results
                </h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Test</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Result</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Reason (if OUT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Appearance</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ballot.appearance.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {ballot.appearance.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {ballot.appearance.status === "OUT" ? (
                          ballot.appearance.reason === "Other" ? ballot.appearance.otherReason : ballot.appearance.reason
                        ) : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Odour</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ballot.odour.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {ballot.odour.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {ballot.odour.status === "OUT" ? (
                          ballot.odour.reason === "Other" ? ballot.odour.otherReason : ballot.odour.reason
                        ) : "-"}
                      </td>
                    </tr>
                    {/* Hide Taste row for Raw Water only */}
                    {ballot.productType !== "Raw Water" && ballot.taste && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">Taste</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ballot.taste.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {ballot.taste.status}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {ballot.taste.status === "OUT" ? (
                            ballot.taste.reason === "Other" ? ballot.taste.otherReason : ballot.taste.reason
                          ) : "-"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Testing Completion & Remarks */}
              <div className="grid grid-cols-2 gap-4">
                {ballot.testingCompletionDate && (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Testing Completion</p>
                    <p className="text-sm text-gray-900">{ballot.testingCompletionDate} at {ballot.testingCompletionTime}</p>
                  </div>
                )}
                {ballot.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Remarks</p>
                    <p className="text-sm text-gray-900 italic">{ballot.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p className="font-semibold">Generated by Global Acqua Pvt Ltd - Sensory Analysis System</p>
          <p className="mt-2">© {new Date().getFullYear()} Global Acqua Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableReport;
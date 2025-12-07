import { ArrowLeft, RefreshCw, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportView = ({ session, onRestart, onBackToHistory }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6 no-print">
          <div>
            {onBackToHistory && (
              <Button
                data-testid="back-to-history-btn"
                onClick={onBackToHistory}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to History</span>
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              data-testid="print-report-btn"
              onClick={handlePrint}
              variant="outline"
              className="flex items-center space-x-2 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </Button>
            <Button
              data-testid="restart-session-btn"
              onClick={onRestart}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center space-x-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Session</span>
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-blue-100 print-full-width">
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Sensory Evaluation Report
                  </h1>
                  <p className="text-base text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Sensory Quality Control
                  </p>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Global Acqua Pvt Ltd
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-semibold">Session Code:</span> <span className="font-mono text-lg text-purple-700">{session.sessionCode}</span>
              </div>
              <div>
                <span className="font-semibold">Completed:</span> {formatDate(session.completedAt || session.createdAt)}
              </div>
            </div>
          </div>

          {/* Panelist Ballots */}
          <div className="space-y-8">
            {session.ballots.map((ballot, index) => {
              const productType = ballot.productType || "";
              return (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200" data-product-type={productType}>
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                    {index + 1}
                  </span>
                  Panelist {index + 1}
                </h3>
                <p className="text-sm font-semibold text-blue-700 mb-4 ml-11" data-testid={`ballot-${index}-panelist-name`}>
                  {ballot.panelistName}
                </p>

                {/* Product Information */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Product Information</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Product Type</p>
                      <p className="text-sm font-medium text-gray-800" data-testid={`ballot-${index}-product-type`}>
                        {ballot.productType === "Other" ? ballot.otherProductType : ballot.productType}
                      </p>
                    </div>

                    {ballot.productVariant && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Product Variant</p>
                        <p className="text-sm font-medium text-gray-800" data-testid={`ballot-${index}-product-variant`}>
                          {ballot.productVariant === "Other" ? ballot.otherProductVariant : ballot.productVariant}
                        </p>
                      </div>
                    )}

                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Product Code</p>
                      <p className="text-sm font-medium text-gray-800" data-testid={`ballot-${index}-product-code`}>{ballot.productCode}</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Date of Manufacturing</p>
                      <p className="text-sm font-medium text-gray-800" data-testid={`ballot-${index}-date-of-mfg`}>{ballot.dateOfMfg}</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Control Sample Code</p>
                      <p className="text-sm font-medium text-gray-800" data-testid={`ballot-${index}-control-sample-code`}>{ballot.controlSampleCode}</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Product Time</p>
                      <p className="text-sm font-medium text-gray-800" data-testid={`ballot-${index}-product-time`}>{ballot.productTime}</p>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Test Results 
                    {ballot.productType === "Raw Water" && <span className="ml-2 text-xs text-red-600">(Raw Water - Taste Hidden)</span>}
                  </h4>
                  <div className="space-y-3">
                    {/* Appearance */}
                    <div className={`bg-white rounded-lg p-4 shadow-sm border-2 ${ballot.appearance.status === "IN" ? "border-green-200" : "border-red-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">Appearance</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ballot.appearance.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} data-testid={`ballot-${index}-appearance-status`}>
                          {ballot.appearance.status}
                        </span>
                      </div>
                      {ballot.appearance.status === "OUT" && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">Reason: <span className="font-semibold text-gray-800" data-testid={`ballot-${index}-appearance-reason`}>{ballot.appearance.reason === "Other" ? ballot.appearance.otherReason : ballot.appearance.reason}</span></p>
                        </div>
                      )}
                    </div>

                    {/* Odour */}
                    <div className={`bg-white rounded-lg p-4 shadow-sm border-2 ${ballot.odour.status === "IN" ? "border-green-200" : "border-red-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">Odour</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ballot.odour.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} data-testid={`ballot-${index}-odour-status`}>
                          {ballot.odour.status}
                        </span>
                      </div>
                      {ballot.odour.status === "OUT" && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">Reason: <span className="font-semibold text-gray-800" data-testid={`ballot-${index}-odour-reason`}>{ballot.odour.reason === "Other" ? ballot.odour.otherReason : ballot.odour.reason}</span></p>
                        </div>
                      )}
                    </div>

                    {/* Taste - Hide for Raw Water and CIP Final Rinse Water */}
                    {(() => {
                      const productType = ballot.productType || "";
                      const isRawWaterType = productType === "Raw Water" || productType === "CIP Final Rinse Water";
                      
                      // Debug log (will appear in browser console)
                      if (typeof window !== 'undefined' && index === 0) {
                        console.log('Product Type:', productType, '| Is Raw Water Type:', isRawWaterType);
                      }
                      
                      // Only show Taste if NOT Raw Water type AND taste data exists
                      if (isRawWaterType || !ballot.taste) {
                        return null;
                      }
                      
                      return (
                        <div className={`bg-white rounded-lg p-4 shadow-sm border-2 ${ballot.taste.status === "IN" ? "border-green-200" : "border-red-200"} ${isRawWaterType ? "hide-taste-raw-water" : ""}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-700">Taste</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${ballot.taste.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} data-testid={`ballot-${index}-taste-status`}>
                              {ballot.taste.status}
                            </span>
                          </div>
                          {ballot.taste.status === "OUT" && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">Reason: <span className="font-semibold text-gray-800" data-testid={`ballot-${index}-taste-reason`}>{ballot.taste.reason === "Other" ? ballot.taste.otherReason : ballot.taste.reason}</span></p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {ballot.remarks && (
                  <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Remarks</p>
                    <p className="text-base text-gray-700" data-testid={`ballot-${index}-remarks`}>{ballot.remarks}</p>
                  </div>
                )}

                {/* Testing Completion */}
                <div className="mt-4 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-lg p-4 shadow-sm border border-cyan-300">
                  <h4 className="text-xs font-bold text-gray-700 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Testing Completion</h4>
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="text-sm font-semibold text-gray-800" data-testid={`ballot-${index}-testing-date`}>{ballot.testingCompletionDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="text-sm font-semibold text-gray-800" data-testid={`ballot-${index}-testing-time`}>{ballot.testingCompletionTime}</p>
                    </div>
                  </div>
                </div>
            </div>
            ))}
          </div>

          {/* Summary Section */}
          {session.summary && (
            <div className="mt-8 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border border-cyan-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Analysis Summary
              </h3>
              <div className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                {JSON.stringify(session.summary, null, 2)}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Generated by Global Acqua Pvt Ltd - Sensory Analysis System</p>
            <p className="mt-1">© {new Date().getFullYear()} - All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
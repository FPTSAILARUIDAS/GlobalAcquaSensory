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
          <Button
            data-testid="back-to-history-btn"
            onClick={onBackToHistory}
            variant="outline"
            className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to History</span>
          </Button>
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
                  <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Sensory Evaluation Report
                  </h1>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Organoleptic Analysis of Water
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-semibold">Session ID:</span> <span className="font-mono">{session.id}</span>
              </div>
              <div>
                <span className="font-semibold">Date:</span> {formatDate(session.createdAt)}
              </div>
            </div>
          </div>

          {/* Panelist Ballots */}
          <div className="space-y-8">
            {session.ballots.map((ballot, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                    {index + 1}
                  </span>
                  Panelist {index + 1}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Product Type</p>
                    <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-product-type`}>{ballot.productType}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Product Code</p>
                    <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-product-code`}>{ballot.productCode}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Date of Manufacturing</p>
                    <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-date-of-mfg`}>{ballot.dateOfMfg}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Control Sample Code</p>
                    <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-control-sample-code`}>{ballot.controlSampleCode}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Product Time</p>
                    <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-product-time`}>{ballot.productTime}</p>
                  </div>

                  {ballot.temperature && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Temperature</p>
                      <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-temperature`}>{ballot.temperature}°C</p>
                    </div>
                  )}

                  {ballot.clarity && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Clarity</p>
                      <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-clarity`}>{ballot.clarity}</p>
                    </div>
                  )}

                  {ballot.color && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Color</p>
                      <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-color`}>{ballot.color}</p>
                    </div>
                  )}

                  {ballot.odor && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Odor</p>
                      <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-odor`}>{ballot.odor}</p>
                    </div>
                  )}

                  {ballot.taste && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Taste</p>
                      <p className="text-base font-medium text-gray-800" data-testid={`ballot-${index}-taste`}>{ballot.taste}</p>
                    </div>
                  )}
                </div>

                {ballot.remarks && (
                  <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Remarks</p>
                    <p className="text-base text-gray-700" data-testid={`ballot-${index}-remarks`}>{ballot.remarks}</p>
                  </div>
                )}
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
            <p>Generated by Global Acqua Sensory Analysis System</p>
            <p className="mt-1">© {new Date().getFullYear()} - All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
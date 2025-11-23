import { useState } from "react";
import { ArrowLeft, Trash2, FileText, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HistoryView = ({ history, onSelectSession, onClearHistory, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterSessions = (sessions) => {
    if (!searchQuery.trim()) return sessions;

    const query = searchQuery.toLowerCase().trim();
    
    return sessions.filter((session) => {
      // Search in session date
      const sessionDate = new Date(session.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).toLowerCase();
      
      if (sessionDate.includes(query)) return true;

      // Search in product codes from all ballots
      const productCodes = session.ballots.map(b => b.productCode?.toLowerCase() || "");
      if (productCodes.some(code => code.includes(query))) return true;

      // Search in testing completion dates
      const testingDates = session.ballots.map(b => b.testingCompletionDate?.toLowerCase() || "");
      if (testingDates.some(date => date.includes(query))) return true;

      // Search in panelist names
      const panelistNames = session.ballots.map(b => b.panelistName?.toLowerCase() || "");
      if (panelistNames.some(name => name.includes(query))) return true;

      return false;
    });
  };

  const filteredHistory = filterSessions(history);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Session History
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                View and access past evaluation sessions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {history.length > 0 && (
                <Button
                  data-testid="clear-history-btn"
                  onClick={onClearHistory}
                  variant="outline"
                  className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </Button>
              )}
              <Button
                data-testid="back-to-dashboard-history-btn"
                onClick={onBack}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {history.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                data-testid="search-history-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by date, batch code, or panelist name..."
                className="pl-12 pr-4 py-6 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-blue-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              No Sessions Yet
            </h3>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Start a new evaluation session to see it here
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-blue-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              No Results Found
            </h3>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              No sessions match your search criteria. Try a different search term.
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="text-sm text-gray-600 mb-3">
              Showing {filteredHistory.length} of {history.length} session{history.length > 1 ? "s" : ""}
            </div>
            {/* Scrollable Container */}
            <div 
              className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-custom"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#3b82f6 #e5e7eb'
              }}
            >
              {filteredHistory.map((session) => (
                <div
                  key={session.id}
                  data-testid={`session-item-${session.sessionCode}`}
                  onClick={() => onSelectSession(session)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-blue-100 hover:border-blue-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center space-x-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          <span>Session</span>
                          <span className="font-mono text-purple-700">{session.sessionCode}</span>
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {session.ballots.length}/{session.targetPanelistCount} Panelists
                          </span>
                        </div>
                        {/* Show product code preview */}
                        {session.ballots.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Batch: {session.ballots[0]?.productCode}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
                      <ArrowLeft className="w-6 h-6 rotate-180" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
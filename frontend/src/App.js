import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Cloud, CloudOff, PlusCircle, ClipboardList, ArrowLeft, Users, CheckCircle, Key, LogOut } from "lucide-react";
import BallotForm from "@/components/BallotForm";
import ReportView from "@/components/ReportView";
import HistoryView from "@/components/HistoryView";
import Login from "@/components/Login";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AppView = {
  DASHBOARD: "DASHBOARD",
  NEW_SESSION: "NEW_SESSION",
  BALLOT_ENTRY: "BALLOT_ENTRY",
  REPORT: "REPORT",
  HISTORY: "HISTORY",
};

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  // App state
  const [view, setView] = useState(AppView.DASHBOARD);
  const [sessionBallots, setSessionBallots] = useState([]);
  const [targetPanelistCount, setTargetPanelistCount] = useState(3);
  const [currentPanelistNumber, setCurrentPanelistNumber] = useState(1);
  const [lastBallotData, setLastBallotData] = useState(undefined);
  const [history, setHistory] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [cloudConnected, setCloudConnected] = useState(true);
  
  // Session code state
  const [sessionCode, setSessionCode] = useState("");
  const [activeSessionCode, setActiveSessionCode] = useState("");
  const [showSessionCodeInput, setShowSessionCodeInput] = useState(false);

  // Fetch history from backend
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setHistory(response.data);
      setCloudConnected(true);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setCloudConnected(false);
    }
  };

  // Restore active session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("active_session");
      if (saved) {
        const data = JSON.parse(saved);
        setSessionBallots(data.sessionBallots || []);
        setView(data.view || AppView.DASHBOARD);
        setTargetPanelistCount(data.targetPanelistCount || 3);
        setLastBallotData(data.lastBallotData);
        setCurrentPanelistNumber((data.sessionBallots || []).length + 1);
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    }
  }, []);

  // Save active session to localStorage
  useEffect(() => {
    if (view === AppView.DASHBOARD) {
      localStorage.removeItem("active_session");
    } else if (view === AppView.NEW_SESSION) {
      localStorage.setItem(
        "active_session",
        JSON.stringify({
          sessionBallots,
          view,
          targetPanelistCount,
          lastBallotData,
        })
      );
    }
  }, [sessionBallots, view, targetPanelistCount, lastBallotData]);

  const handleStartSession = (count) => {
    setTargetPanelistCount(count);
    setSessionBallots([]);
    setCurrentPanelistNumber(1);
    setLastBallotData(undefined);
    setView(AppView.NEW_SESSION);
  };

  const handleBallotSubmit = (ballotData) => {
    const updatedBallots = [...sessionBallots, ballotData];
    setSessionBallots(updatedBallots);
    setLastBallotData(ballotData);

    if (updatedBallots.length >= targetPanelistCount) {
      handleSessionComplete(updatedBallots);
    } else {
      setCurrentPanelistNumber(updatedBallots.length + 1);
    }
  };

  const handleSessionComplete = async (ballots) => {
    try {
      const response = await axios.post(`${API}/sessions`, {
        ballots: ballots,
        summary: null,
      });
      setSelectedSession(response.data);
      setView(AppView.REPORT);
      localStorage.removeItem("active_session");
      fetchHistory();
    } catch (error) {
      console.error("Failed to save session:", error);
      setSelectedSession({ id: crypto.randomUUID(), status: "completed", ballots, createdAt: new Date().toISOString(), summary: null });
      setView(AppView.REPORT);
    }
  };

  const handleBackToPrevious = () => {
    if (currentPanelistNumber > 1) {
      const updatedBallots = sessionBallots.slice(0, -1);
      setSessionBallots(updatedBallots);
      setCurrentPanelistNumber(currentPanelistNumber - 1);
    }
  };

  const handleViewHistory = () => {
    fetchHistory();
    setView(AppView.HISTORY);
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setView(AppView.REPORT);
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      try {
        await axios.delete(`${API}/sessions`);
        setHistory([]);
        localStorage.removeItem("sensory_history");
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  const handleBackToDashboard = () => {
    setView(AppView.DASHBOARD);
    setSessionBallots([]);
    setCurrentPanelistNumber(1);
    setLastBallotData(undefined);
    setSelectedSession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-blue-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Global Acqua Sensory
              </h1>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
              {cloudConnected ? (
                <>
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === AppView.DASHBOARD && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#0369a1' }}>
                Organoleptic Water Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                Digitize sensory evaluation with independent panelist opinions for comprehensive compliance reporting
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* New Session Card */}
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-blue-100 hover:border-blue-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  New Session
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Start a new sensory evaluation with multiple panelists
                </p>
                <div className="space-y-3">
                  <button
                    data-testid="start-session-1-btn"
                    onClick={() => handleStartSession(1)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Users className="w-5 h-5" />
                    <span>1 Panelist</span>
                  </button>
                  <button
                    data-testid="start-session-2-btn"
                    onClick={() => handleStartSession(2)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Users className="w-5 h-5" />
                    <span>2 Panelists</span>
                  </button>
                  <button
                    data-testid="start-session-3-btn"
                    onClick={() => handleStartSession(3)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Users className="w-5 h-5" />
                    <span>3 Panelists</span>
                  </button>
                </div>
              </div>

              {/* History Card */}
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-blue-100 hover:border-blue-300">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  View History
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Access and review past evaluation sessions
                </p>
                <button
                  data-testid="view-history-btn"
                  onClick={handleViewHistory}
                  className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <span>View Sessions</span>
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}

        {view === AppView.NEW_SESSION && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <button
                  data-testid="back-to-dashboard-btn"
                  onClick={handleBackToDashboard}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">
                    Panelist {currentPanelistNumber} of {targetPanelistCount}
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: targetPanelistCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-1.5 rounded-full transition-colors duration-300 ${
                          idx < sessionBallots.length ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <BallotForm
                key={currentPanelistNumber}
                panelistNumber={currentPanelistNumber}
                onSubmit={handleBallotSubmit}
                initialData={lastBallotData}
                onBack={currentPanelistNumber > 1 ? handleBackToPrevious : undefined}
              />
            </div>
          </div>
        )}

        {view === AppView.REPORT && selectedSession && (
          <ReportView
            session={selectedSession}
            onRestart={handleBackToDashboard}
            onBackToHistory={handleViewHistory}
          />
        )}

        {view === AppView.HISTORY && (
          <HistoryView
            history={history}
            onSelectSession={handleSelectSession}
            onClearHistory={handleClearHistory}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}

export default App;
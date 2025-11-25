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

  // Check for stored auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        setAuthToken(auth.token);
        setUserRole(auth.role);
        setUsername(auth.username);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to restore auth:", error);
        localStorage.removeItem("auth");
      }
    }
  }, []);

  // Fetch history from backend
  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchHistory();
    }
  }, [isAuthenticated, authToken]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/sessions`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setHistory(response.data);
      setCloudConnected(true);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setCloudConnected(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password });
      const { access_token, role, username: user } = response.data;
      
      setAuthToken(access_token);
      setUserRole(role);
      setUsername(user);
      setIsAuthenticated(true);
      
      // Store auth
      localStorage.setItem("auth", JSON.stringify({ token: access_token, role, username: user }));
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setUserRole(null);
    setUsername(null);
    localStorage.removeItem("auth");
    setView(AppView.DASHBOARD);
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

  const handleStartSession = async (count) => {
    setTargetPanelistCount(count);
    
    // Create a collaborative session
    try {
      const response = await axios.post(`${API}/sessions/create`, 
        { targetPanelistCount: count },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setActiveSessionCode(response.data.sessionCode);
      setSessionBallots([]);
      setCurrentPanelistNumber(1);
      setLastBallotData(undefined);
      setView(AppView.BALLOT_ENTRY);
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      alert("Please enter a session code");
      return;
    }

    try {
      const response = await axios.get(`${API}/sessions/code/${sessionCode}`);
      const session = response.data;
      
      if (session.status === "completed") {
        alert("This session is already completed");
        return;
      }

      setActiveSessionCode(sessionCode);
      setTargetPanelistCount(session.targetPanelistCount);
      setSessionBallots(session.ballots);
      setCurrentPanelistNumber(session.ballots.length + 1);
      
      // If there's at least one ballot, use its data as template for the new panelist
      if (session.ballots && session.ballots.length > 0) {
        const firstBallot = session.ballots[0];
        const templateData = {
          productType: firstBallot.productType,
          otherProductType: firstBallot.otherProductType,
          productVariant: firstBallot.productVariant,
          otherProductVariant: firstBallot.otherProductVariant,
          productCode: firstBallot.productCode,
          dateOfMfg: firstBallot.dateOfMfg,
          controlSampleCode: firstBallot.controlSampleCode,
          productTime: firstBallot.productTime,
        };
        setLastBallotData(templateData);
      }
      
      setView(AppView.BALLOT_ENTRY);
      setShowSessionCodeInput(false);
    } catch (error) {
      console.error("Failed to join session:", error);
      alert("Invalid session code or session not found");
    }
  };

  const handleBallotSubmit = async (ballotData) => {
    try {
      // Submit ballot to the collaborative session
      const response = await axios.post(`${API}/sessions/submit-ballot`, {
        sessionCode: activeSessionCode,
        ballotData: ballotData
      });
      
      const updatedSession = response.data;
      setSessionBallots(updatedSession.ballots);
      
      // For the first panelist, store their data as template for subsequent panelists
      // Only store common product information, not individual test results
      if (updatedSession.ballots.length === 1) {
        const templateData = {
          productType: ballotData.productType,
          otherProductType: ballotData.otherProductType,
          productVariant: ballotData.productVariant,
          otherProductVariant: ballotData.otherProductVariant,
          productCode: ballotData.productCode,
          dateOfMfg: ballotData.dateOfMfg,
          controlSampleCode: ballotData.controlSampleCode,
          productTime: ballotData.productTime,
        };
        setLastBallotData(templateData);
      }

      if (updatedSession.status === "completed") {
        setSelectedSession(updatedSession);
        setView(AppView.REPORT);
        localStorage.removeItem("active_session");
        fetchHistory();
      } else {
        setCurrentPanelistNumber(updatedSession.ballots.length + 1);
        alert(`Ballot submitted! Waiting for ${updatedSession.targetPanelistCount - updatedSession.ballots.length} more panelist(s).`);
      }
    } catch (error) {
      console.error("Failed to submit ballot:", error);
      alert("Failed to submit ballot. Please try again.");
    }
  };

  const handleBackToPrevious = () => {
    if (currentPanelistNumber > 1) {
      const updatedBallots = sessionBallots.slice(0, -1);
      setSessionBallots(updatedBallots);
      setCurrentPanelistNumber(currentPanelistNumber - 1);
    }
  };

  const handleBackToDashboard = () => {
    setView(AppView.DASHBOARD);
    setSessionBallots([]);
    setCurrentPanelistNumber(1);
    setLastBallotData(undefined);
    setSelectedSession(null);
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show admin dashboard for admin users
  if (userRole === "admin") {
    return <AdminDashboard authToken={authToken} onLogout={handleLogout} username={username} />;
  }

  // Regular user interface
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
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Global Acqua Pvt Ltd
                </h1>
                <p className="text-xs text-gray-600">User: {username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
              <Button
                data-testid="user-logout-btn"
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
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
                Sensory Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                Digitize sensory evaluation with independent panelist opinions for comprehensive compliance reporting
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* New Session Card */}
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-blue-100 hover:border-blue-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  New Session
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Create a collaborative session
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

              {/* Join Session Card */}
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-blue-100 hover:border-blue-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Join Session
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Enter session code to join
                </p>
                {!showSessionCodeInput ? (
                  <button
                    data-testid="show-join-session-btn"
                    onClick={() => setShowSessionCodeInput(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Key className="w-5 h-5" />
                    <span>Enter Code</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Input
                      data-testid="session-code-input"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      placeholder="Enter session code"
                      className="text-center font-mono text-lg"
                      maxLength={8}
                    />
                    <button
                      data-testid="join-session-btn"
                      onClick={handleJoinSession}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Join Session
                    </button>
                    <button
                      onClick={() => setShowSessionCodeInput(false)}
                      className="w-full text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === AppView.BALLOT_ENTRY && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto">
              {/* Session Code Display */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Session Code (Share with other panelists)</p>
                  <p className="text-3xl font-bold font-mono text-purple-700">{activeSessionCode}</p>
                </div>
              </div>

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
            onBackToHistory={null}
          />
        )}
      </main>
    </div>
  );
}

export default App;
import { useState, useEffect } from "react";
import { UserPlus, Users as UsersIcon, Trash2, Download, LogOut, FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ authToken, onLogout, username }) => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
  const [message, setMessage] = useState("");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "sessions") {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, axiosConfig);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/admin/sessions/all`, axiosConfig);
      setSessions(response.data);
      setFilteredSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  // Search/Filter sessions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sessions.filter(session => {
      try {
        // Search by session code
        if (session.sessionCode && session.sessionCode.toLowerCase().includes(query)) return true;
        
        // Search by date
        if (session.createdAt) {
          const dateStr = new Date(session.createdAt).toLocaleDateString().toLowerCase();
          if (dateStr.includes(query)) return true;
        }
        
        // Search by product code from ballots
        if (session.ballots && session.ballots.length > 0) {
          const hasMatchingProductCode = session.ballots.some(ballot => 
            ballot.productCode && ballot.productCode.toLowerCase().includes(query)
          );
          if (hasMatchingProductCode) return true;
        }
        
        // Search by panelist name
        if (session.ballots && session.ballots.length > 0) {
          const hasMatchingPanelist = session.ballots.some(ballot => 
            ballot.panelistName && ballot.panelistName.toLowerCase().includes(query)
          );
          if (hasMatchingPanelist) return true;
        }
      } catch (error) {
        console.error("Error filtering session:", error, session);
      }
      
      return false;
    });
    
    setFilteredSessions(filtered);
  }, [searchQuery, sessions]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/users`, newUser, axiosConfig);
      setMessage(`User '${newUser.username}' created successfully!`);
      setNewUser({ username: "", password: "", role: "user" });
      fetchUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to create user");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user '${username}'?`)) {
      try {
        await axios.delete(`${API}/admin/users/${username}`, axiosConfig);
        setMessage(`User '${username}' deleted successfully`);
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage(error.response?.data?.detail || "Failed to delete user");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  const handleDeleteSession = async (sessionCode) => {
    if (window.confirm(`Are you sure you want to delete session '${sessionCode}'? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API}/admin/sessions/${sessionCode}`, axiosConfig);
        setMessage(`Session '${sessionCode}' deleted successfully`);
        fetchSessions();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage(error.response?.data?.detail || "Failed to delete session");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header - Mobile Responsive */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-blue-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Welcome, {username}</p>
              </div>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={onLogout}
              variant="outline"
              className="flex items-center space-x-1 sm:space-x-2 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Message */}
        {message && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm sm:text-base">
            {message}
          </div>
        )}

        {/* Tabs - Mobile Responsive */}
        <div className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6 overflow-x-auto">
          <Button
            data-testid="tab-users"
            onClick={() => setActiveTab("users")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
              activeTab === "users"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 inline" />
            <span className="hidden xs:inline sm:inline">User Management</span>
            <span className="xs:hidden sm:hidden">Users</span>
          </Button>
          <Button
            data-testid="tab-sessions"
            onClick={() => setActiveTab("sessions")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
              activeTab === "sessions"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 inline" />
            <span className="hidden xs:inline sm:inline">All Sessions</span>
            <span className="xs:hidden sm:hidden">Sessions</span>
          </Button>
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Create User Form */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
                Create New User
              </h2>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username *</Label>
                  <Input
                    id="new-username"
                    data-testid="input-new-username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password *</Label>
                  <Input
                    id="new-password"
                    data-testid="input-new-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger data-testid="select-new-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" data-testid="create-user-btn" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    Create User
                  </Button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                All Users ({users.length})
              </h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{user.username}</p>
                        {user.username === "admin" && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300 w-fit">
                            DEFAULT - PROTECTED
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                          user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {user.role}
                        </span>
                        <span className="sm:ml-3">Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {user.username !== "admin" ? (
                      <Button
                        data-testid={`delete-user-${user.username}`}
                        onClick={() => handleDeleteUser(user.username)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="px-4 py-2 text-xs text-gray-500 italic">
                        Cannot delete
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
            {/* Header with Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                All Sessions ({filteredSessions.length})
              </h2>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by date, product code, session code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 w-full text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    {searchQuery ? "No sessions found matching your search" : "No sessions available"}
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                <div key={session.id} className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">Session Code: <span className="font-mono text-blue-600">{session.sessionCode}</span></p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                          session.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:space-x-4">
                          <span>Panelists: {session.ballots.length}/{session.targetPanelistCount}</span>
                          <span>Created by: {session.createdBy}</span>
                        </div>
                        <div>Date: {new Date(session.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        data-testid={`view-session-${session.sessionCode}`}
                        onClick={() => window.open(`/report/${session.sessionCode}`, '_blank')}
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Detailed</span>
                      </Button>
                      <Button
                        data-testid={`summary-session-${session.sessionCode}`}
                        onClick={() => window.open(`/summary/${session.sessionCode}`, '_blank')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Summary</span>
                      </Button>
                      <Button
                        data-testid={`delete-session-${session.sessionCode}`}
                        onClick={() => handleDeleteSession(session.sessionCode)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
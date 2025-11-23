import { useState, useEffect } from "react";
import { UserPlus, Users as UsersIcon, Trash2, Download, LogOut, FileText } from "lucide-react";
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
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

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

  const downloadReport = (session) => {
    try {
      const reportData = JSON.stringify(session, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${session.sessionCode}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage(`Report downloaded: ${session.sessionCode}`);
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Failed to download report');
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-blue-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome, {username}</p>
              </div>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={onLogout}
              variant="outline"
              className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            data-testid="tab-users"
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "users"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <UsersIcon className="w-5 h-5 mr-2 inline" />
            User Management
          </Button>
          <Button
            data-testid="tab-sessions"
            onClick={() => setActiveTab("sessions")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "sessions"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <FileText className="w-5 h-5 mr-2 inline" />
            All Sessions
          </Button>
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Create User Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <UserPlus className="w-6 h-6 inline mr-2" />
                Create New User
              </h2>
              <form onSubmit={handleCreateUser} className="grid md:grid-cols-4 gap-4">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                All Users ({users.length})
              </h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-800">{user.username}</p>
                      <p className="text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {user.role}
                        </span>
                        <span className="ml-3">Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    {user.username !== "admin" && (
                      <Button
                        data-testid={`delete-user-${user.username}`}
                        onClick={() => handleDeleteUser(user.username)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              All Sensory Analysis Sessions ({sessions.length})
            </h2>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-semibold text-gray-800">Session Code: <span className="font-mono text-blue-600">{session.sessionCode}</span></p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          session.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Panelists: {session.ballots.length}/{session.targetPanelistCount} | 
                        Created by: {session.createdBy} | 
                        Date: {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      data-testid={`download-session-${session.sessionCode}`}
                      onClick={() => downloadReport(session)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
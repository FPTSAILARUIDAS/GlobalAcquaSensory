import { useState } from "react";
import { LogIn, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            {/* Circular Logo with Water Bottle */}
            <div className="flex justify-center mb-4">
              <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-lg">
                {/* Outer Circle */}
                <circle cx="80" cy="80" r="75" fill="url(#gradient1)" stroke="#1e40af" strokeWidth="2"/>
                
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#bfdbfe', stopOpacity: 0.9 }} />
                    <stop offset="50%" style={{ stopColor: '#60a5fa', stopOpacity: 0.7 }} />
                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
                  </linearGradient>
                  <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#dbeafe', stopOpacity: 0.9 }} />
                    <stop offset="100%" style={{ stopColor: '#93c5fd', stopOpacity: 0.7 }} />
                  </linearGradient>
                </defs>
                
                {/* Circular Text Path */}
                <defs>
                  <path id="circlePath" d="M 80, 80 m -65, 0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0" fill="none"/>
                </defs>
                
                {/* Circular Text */}
                <text fill="white" fontSize="13" fontWeight="bold" fontFamily="Space Grotesk, sans-serif">
                  <textPath href="#circlePath" startOffset="5%">
                    GLOBAL ACQUA PVT LTD • QUALITY CONTROL •
                  </textPath>
                </text>
                
                {/* Water Bottle in Center */}
                <g transform="translate(80, 80)">
                  {/* Bottle Cap */}
                  <rect x="-8" y="-35" width="16" height="8" rx="2" fill="#1e40af"/>
                  <rect x="-6" y="-32" width="12" height="3" fill="#1e3a8a"/>
                  
                  {/* Bottle Neck */}
                  <path d="M -6,-27 L -8,-15 L 8,-15 L 6,-27 Z" fill="url(#bottleGradient)" stroke="#1e40af" strokeWidth="1"/>
                  
                  {/* Bottle Body */}
                  <rect x="-12" y="-15" width="24" height="40" rx="3" fill="url(#bottleGradient)" stroke="#1e40af" strokeWidth="1.5"/>
                  
                  {/* Water Inside Bottle */}
                  <rect x="-10" y="-10" width="20" height="30" rx="2" fill="url(#waterGradient)" opacity="0.8"/>
                  
                  {/* Water Wave Effect */}
                  <path d="M -10,-10 Q -5,-8 0,-10 T 10,-10 L 10,20 L -10,20 Z" fill="#dbeafe" opacity="0.5"/>
                  
                  {/* Bottle Highlights */}
                  <ellipse cx="-6" cy="-5" rx="3" ry="8" fill="white" opacity="0.3"/>
                  <ellipse cx="6" cy="5" rx="2" ry="6" fill="white" opacity="0.2"/>
                  
                  {/* Label on Bottle */}
                  <rect x="-9" y="0" width="18" height="12" rx="1" fill="white" opacity="0.7"/>
                  <text x="0" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#1e40af" fontFamily="Arial">KINLEY</text>
                  
                  {/* Bottle Base */}
                  <ellipse cx="0" cy="25" rx="12" ry="3" fill="#1e40af" opacity="0.3"/>
                </g>
                
                {/* Inner Circle Border */}
                <circle cx="80" cy="80" r="50" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
              </svg>
            </div>
            
            <p className="text-sm sm:text-base text-gray-600 mb-2 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sensory Quality Control System
            </p>
            <p className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sign in to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  data-testid="input-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="login-btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Developer Credit */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Developed by <span className="font-semibold text-gray-700">Mr Saila Ruidas</span> in collaboration with <span className="font-semibold text-gray-700">Emergent Lab</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
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
      setError(err.message || "Login failed. Please try again.");
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
            {/* Circular Logo with Kinley Bottle Image */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-xl">
                  {/* Outer Circle */}
                  <circle cx="100" cy="100" r="95" fill="url(#gradient1)" stroke="#1e40af" strokeWidth="3"/>
                  
                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                    </linearGradient>
                    
                    {/* Clip path for circular image */}
                    <clipPath id="circleClip">
                      <circle cx="100" cy="100" r="65"/>
                    </clipPath>
                  </defs>
                  
                  {/* Circular Text Path - Top Half */}
                  <defs>
                    <path id="circlePathTop" d="M 100, 100 m -80, 0 a 80,80 0 0,1 160,0" fill="none"/>
                  </defs>
                  
                  {/* Circular Text - Top */}
                  <text fill="white" fontSize="15" fontWeight="bold" fontFamily="Space Grotesk, sans-serif" letterSpacing="1.5">
                    <textPath href="#circlePathTop" startOffset="50%" textAnchor="middle">
                      GLOBAL ACQUA PVT LTD
                    </textPath>
                  </text>
                  
                  {/* Circular Text Path - Bottom Half */}
                  <defs>
                    <path id="circlePathBottom" d="M 100, 100 m -80, 0 a 80,80 0 0,0 160,0" fill="none"/>
                  </defs>
                  
                  {/* Circular Text - Bottom */}
                  <text fill="white" fontSize="15" fontWeight="bold" fontFamily="Space Grotesk, sans-serif" letterSpacing="1.5">
                    <textPath href="#circlePathBottom" startOffset="50%" textAnchor="middle">
                      QUALITY • SENSORY TEST
                    </textPath>
                  </text>
                  
                  {/* White background circle for bottle */}
                  <circle cx="100" cy="100" r="65" fill="white" opacity="1"/>
                  
                  {/* Kinley Bottle Image - Much Larger */}
                  <image 
                    href="https://customer-assets.emergentagent.com/job_watertestapp/artifacts/ggyi19mv_265718-2_5-kinley-drinking-water-with-added-minerals.webp"
                    x="45" 
                    y="20" 
                    width="110" 
                    height="160"
                    clipPath="url(#circleClip)"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  
                  {/* Inner Circle Border */}
                  <circle cx="100" cy="100" r="65" fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.5"/>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
                </svg>
              </div>
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
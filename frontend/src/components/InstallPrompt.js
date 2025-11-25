import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed (optional)
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 shadow-2xl z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="bg-white rounded-lg p-2">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">Install Sensory App</h3>
            <p className="text-xs sm:text-sm text-blue-100">
              Install on your device for instant access & offline use
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            onClick={handleInstallClick}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-sm px-4 py-2"
          >
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-blue-200 p-2"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;

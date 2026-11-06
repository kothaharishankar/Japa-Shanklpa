import React, { useState, useEffect } from 'react';
import { Download, WifiOff, X, Share } from 'lucide-react';

export const PwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Online / offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install prompt listener
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    if (isIosDevice && !isInStandaloneMode) {
      setIsIos(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Offline Status Pill */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-1.5 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active. All chanting and progress is saved locally.</span>
        </div>
      )}

      {/* Android/Chrome Install Banner */}
      {isInstallable && (
        <div className="bg-primary text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-accent-gold" />
            <span className="font-medium">Install Japa Sankalpa on your home screen for full offline devotion</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Instruction Button */}
      {isIos && !showIosPrompt && (
        <div className="bg-primary-sage border-b border-border text-text-primary px-4 py-2 text-xs flex items-center justify-between">
          <span>Tap to add Japa Sankalpa to your iPhone Home Screen</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIosPrompt(true)}
              className="font-bold text-primary underline"
            >
              How to Install
            </button>
            <button onClick={() => setDismissed(true)} className="text-text-secondary">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Modal instructions */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-3 shadow-2xl border border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Install on iPhone / iPad</h3>
              <button onClick={() => setShowIosPrompt(false)} className="text-text-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="text-xs text-text-secondary space-y-2 list-decimal list-inside">
              <li>Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-primary" /> <strong>Share</strong> button at the bottom of Safari.</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right.</li>
            </ol>
            <button
              onClick={() => setShowIosPrompt(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

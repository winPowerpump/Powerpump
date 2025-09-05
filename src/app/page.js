"use client";

import { useEffect, useState } from "react";
import AddressDisplay from "./components/copy";
import Link from "next/link";

export default function Home() {
  const [countdown, setCountdown] = useState(60);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [isTimeSynced, setIsTimeSynced] = useState(false);

  const contractAddress = "XXXpump";

  // Get server-synchronized time
  const getServerTime = () => {
    const localTime = new Date();
    return new Date(localTime.getTime() + serverTimeOffset);
  };

  // Calculate seconds until next minute using server time
  const getSecondsUntilNextMinute = () => {
    const serverTime = getServerTime();
    const secondsElapsed = serverTime.getSeconds();
    const millisecondsElapsed = serverTime.getMilliseconds();
    
    const totalElapsedMs = (secondsElapsed * 1000) + millisecondsElapsed;
    const millisecondsUntilNext = 60000 - totalElapsedMs;
    return Math.ceil(millisecondsUntilNext / 1000);
  };

  // Sync with server time
  const syncServerTime = async () => {
    try {
      const requestStart = Date.now();
      const res = await fetch("/api/claim", { method: "POST" });
      const requestEnd = Date.now();
      const data = await res.json();
      
      if (data.serverTime) {
        const serverTime = new Date(data.serverTime).getTime();
        const networkLatency = (requestEnd - requestStart) / 2;
        const adjustedServerTime = serverTime + networkLatency;
        const localTime = requestEnd;
        
        const offset = adjustedServerTime - localTime;
        setServerTimeOffset(offset);
        setIsTimeSynced(true);
        
        const secondsLeft = data.secondsUntilNext || getSecondsUntilNextMinute();
        setCountdown(secondsLeft);
        
        setWinners(data.winners || []);
        
        console.log(`Time synced. Offset: ${offset}ms, Countdown: ${secondsLeft}s`);
      }
    } catch (e) {
      console.error("Failed to sync server time:", e);
      setIsTimeSynced(false);
    }
  };

  // Initial sync on component mount
  useEffect(() => {
    syncServerTime();
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!isTimeSynced) return;

    const interval = setInterval(() => {
      const secondsLeft = getSecondsUntilNextMinute();
      setCountdown(secondsLeft);
      
      if (secondsLeft >= 59) {
        setTimeout(() => {
          syncServerTime();
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimeSynced, serverTimeOffset]);

  // Periodic winner fetching and re-sync
  useEffect(() => {
    const interval = setInterval(() => {
      syncServerTime();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function handleManualClaim() {
    setLoading(true);
    try {
      const res = await fetch("/api/claim");
      await res.json();
      syncServerTime();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const formatLastClaimTime = (time) => {
    if (!time) return "Unknown";
    return time.toLocaleTimeString();
  };

  return (
    <>
      {/* Static marquee that won't be affected by React re-renders */}
      <div 
        id="static-marquee" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: '0.875rem',
          padding: '2px 0',
          zIndex: 0,
        }}
        dangerouslySetInnerHTML={{
          __html: `
            <div style="
              display: inline-block;
              animation: marquee 30s linear infinite;
              padding-left: 100%;
            ">
              Powerpump is a fully automated lottery protocol built on&nbsp;
              <a href="https://pump.fun" style="color: #3b82f6; text-decoration: underline;">pump.fun</a>
              . Users who hold the $POWER token are automatically eligible for the pump jackpot. Users have a weight assigned to them based on how much they hold relative to others. Fully transparent, equitable, and fair. Happy pumping!&nbsp;
              Powerpump is a fully automated lottery protocol built on&nbsp;
              <a href="https://pump.fun" style="color: #3b82f6; text-decoration: underline;">pump.fun</a>
              . Users who hold the $POWER token are automatically eligible for the pump jackpot. Users have a weight assigned to them based on how much they hold relative to others. Fully transparent, equitable, and fair. Happy pumping!&nbsp;
            </div>
            <style>
              @keyframes marquee {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-100%, 0, 0); }
              }
              #static-marquee a:hover {
                color: #60a5fa !important;
              }
            </style>
          `
        }}
      />

      <main className="min-h-screen bg-[#15161B] text-white overflow-hidden relative">

        <div className="fixed inset-0 bg-black/20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="fixed top-5 right-3 z-50 flex items-center">
          <Link
            href="https://x.com/powerpumpfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold text-base hover:text-gray-300 transition-colors pointer-events-auto px-2 py-1"
          >
            𝕏
          </Link>
          <div className="pointer-events-auto">
            <AddressDisplay contractAddress={contractAddress} />
          </div>
        </div>

        <div className="fixed bottom-3 right-3 z-50 flex items-center">
          <Link
            href="https://x.com/powerpumpfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline text-base hover:text-gray-300 transition-colors pointer-events-auto px-2 py-1"
          >
            github
          </Link>
        </div>
        
        <div className="relative z-10 flex flex-col items-center p-4 sm:p-8">

          <div className="text-center my-8">
            <img 
              src="/power.png" 
              alt="Power" 
              className="h-16 sm:h-24 mx-auto mb-4"
            />
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 text-center mb-8 min-w-[280px]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <p className="text-base font-semibold text-white">Next pump in</p>
              {!isTimeSynced && (
                <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
                  Syncing...
                </span>
              )}
            </div>
            <div className="bg-[#67D682] rounded-2xl p-4">
              <h2 className="text-5xl sm:text-6xl font-bold">{countdown}s</h2>
            </div>
            {lastClaimTime && (
              <div className="mt-3 hidden">
                <p className="text-xs text-white/60">
                  Last distribution: {formatLastClaimTime(lastClaimTime)}
                </p>
              </div>
            )}
          </div>

          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold">
                Recent Winners
              </h2>
            </div>
            
            <div className="space-y-4">
              {winners.length === 0 ? (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
                  <p className="text-white/60 text-lg font-semibold">
                    No winners yet...
                  </p>
                </div>
              ) : (
                winners.map((w, i) => (
                  <div
                    key={i}
                    className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6 hover:bg-black/50 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-mono text-sm sm:text-base font-bold text-white">
                          {w.wallet.slice(0, 6)}...{w.wallet.slice(-6)}
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                          {w.created_at ? new Date(w.created_at).toLocaleString() : 'Invalid Date'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl text-white">
                          {w.amount.toFixed(4)} SOL
                        </p>
                        {w.signature && (
                          <a
                            href={`https://solscan.io/tx/${w.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline font-semibold"
                          >
                            View on Solscan →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
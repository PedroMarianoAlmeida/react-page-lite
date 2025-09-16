import { useState, useEffect } from "react";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">Live Clock</h3>
      <div className="text-3xl font-mono font-bold">
        {time.toLocaleTimeString()}
      </div>
      <div className="text-sm opacity-90 mt-1">
        {time.toLocaleDateString()}
      </div>
      <p className="text-xs opacity-75 mt-3">
        This clock updates every second using client-side JavaScript
      </p>
    </div>
  );
}
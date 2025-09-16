import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setCount((count) => count + 1)}
      >
        count is {count}
      </button>
      <p className="text-gray-600 mt-2">
        Edit{" "}
        <code className="bg-gray-100 px-1 rounded">
          src/components/Counter.tsx
        </code>{" "}
        and save to test HMR
      </p>
    </div>
  );
}

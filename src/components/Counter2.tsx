import { useState } from "react";

interface Counter2Props {
  initialValue?: number;
}

export function Counter2({ initialValue = 0 }: Counter2Props) {
  const [count, setCount] = useState(initialValue);

  return (
    <div className="card border border-gray-300 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Counter 2 (with initial value)</h3>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
        onClick={() => setCount((count) => count + 1)}
      >
        count is {count}
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        onClick={() => setCount(initialValue)}
      >
        reset
      </button>
      <p className="text-gray-600 mt-2 text-sm">
        Started with initial value: <code className="bg-gray-100 px-1 rounded">{initialValue}</code>
      </p>
    </div>
  );
}
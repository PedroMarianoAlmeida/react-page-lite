import { useState } from "react";

export function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [customColor, setCustomColor] = useState("#FF0000");

  const predefinedColors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Color Picker</h3>

      <div
        className="w-full h-24 rounded-lg border-2 border-gray-300 mb-4 flex items-center justify-center text-white font-semibold"
        style={{ backgroundColor: selectedColor }}
      >
        {selectedColor}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a predefined color:
        </label>
        <div className="grid grid-cols-4 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                selectedColor === color ? 'border-gray-800 scale-105' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or pick a custom color:
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <button
            onClick={() => setSelectedColor(customColor)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Apply Custom Color
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        This component demonstrates state management and event handling in an island.
      </p>
    </div>
  );
}
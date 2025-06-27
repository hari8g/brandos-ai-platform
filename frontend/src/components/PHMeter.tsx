import React from "react"

export default function PHMeter({ ph }: { ph: number }) {
  const percentage = ((ph - 3.5) / (7.5 - 3.5)) * 100

  return (
    <div className="w-full">
      <div className="text-xs mb-1 text-gray-500">Predicted pH: {ph}</div>
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-400 via-yellow-300 to-green-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>3.5</span>
        <span>5.5 (ideal)</span>
        <span>7.5</span>
      </div>
    </div>
  )
}

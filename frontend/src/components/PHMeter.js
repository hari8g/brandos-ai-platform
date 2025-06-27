import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export default function PHMeter({ ph }) {
    const percentage = ((ph - 3.5) / (7.5 - 3.5)) * 100;
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "text-xs mb-1 text-gray-500", children: ["Predicted pH: ", ph] }), _jsx("div", { className: "relative w-full h-4 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-red-400 via-yellow-300 to-green-400", style: { width: `${percentage}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [_jsx("span", { children: "3.5" }), _jsx("span", { children: "5.5 (ideal)" }), _jsx("span", { children: "7.5" })] })] }));
}

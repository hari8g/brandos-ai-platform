import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
const categories = [
    { label: "Cosmetics", color: "bg-pink-100 text-pink-800 hover:bg-pink-200" },
    { label: "Nutrition", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    { label: "Petfood", color: "bg-green-100 text-green-800 hover:bg-green-200" },
];
export default function CategorySelector({ selected, onSelect, }) {
    return (_jsxs("div", { className: "w-full mb-6 flex flex-col items-center", children: [_jsx("p", { className: "mb-4 font-semibold text-gray-700 text-center", children: "Choose a category:" }), _jsx("div", { className: "flex justify-center gap-3 flex-nowrap w-full max-w-6xl px-4", children: categories.map(({ label, color }) => (_jsx("button", { onClick: () => onSelect(label), className: cn("rounded-full px-4 py-2 text-sm font-medium transition-all shadow-sm border border-transparent whitespace-nowrap", color, selected === label && "ring-2 ring-indigo-500 scale-105"), children: label }, label))) })] }));
}

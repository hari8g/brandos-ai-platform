import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import FormulationCard from "./components/FormulationCard";
import PromptInput from "./components/PromptInput";
import CategorySelector from "./components/CategorySelector";
export default function App() {
    const [formulation, setFormulation] = useState(null);
    const [category, setCategory] = useState(null);
    // Debug: log formulation state
    console.log("Formulation state:", formulation);
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-100 to-gray-200 text-gray-800 relative overflow-hidden", children: [_jsxs("div", { className: "relative w-full max-w-5xl text-center py-20 px-6 z-10", children: [_jsxs("h1", { className: "text-4xl md:text-5xl font-extrabold tracking-tight text-center whitespace-nowrap", children: [_jsx("span", { className: "text-indigo-600", children: "Build Smarter - " }), " Launch Faster"] }), _jsx("p", { className: "mt-4 text-md text-gray-600 max-w-full whitespace-nowrap overflow-x-auto", children: "Design validated, scalable products with formulation intelligence at your fingertips" }), _jsx("div", { className: "absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-blob" }), _jsx("div", { className: "absolute bottom-[-80px] right-[-80px] w-[250px] h-[250px] bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 rounded-full blur-2xl opacity-30 animate-blob animation-delay-2000" })] }), _jsxs("div", { className: "w-full max-w-xl px-6 z-20", children: [_jsx(CategorySelector, { selected: category, onSelect: setCategory }), _jsx(PromptInput, { onResult: setFormulation, selectedCategory: category }), formulation && (_jsxs(_Fragment, { children: [_jsx("h3", { className: "mt-8 mb-4 text-xl font-semibold text-center text-indigo-700", children: "Generated Formulation" }), _jsx(FormulationCard, { data: formulation })] }))] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { categoryPrompts } from "@/utils/rotating-prompts";
export default function PromptInput({ onResult, selectedCategory, }) {
    const [prompt, setPrompt] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [loading, setLoading] = useState(false);
    const [queryQuality, setQueryQuality] = useState(null);
    const [showQualityFeedback, setShowQualityFeedback] = useState(false);
    const [location, setLocation] = useState("");
    useEffect(() => {
        if (!selectedCategory) {
            setPlaceholder("Enter your product idea...");
            return;
        }
        const prompts = categoryPrompts[selectedCategory] || [];
        let current = 0;
        let switchingInterval;
        let isCancelled = false;
        const typePrompt = async (text) => {
            setPlaceholder(""); // clear before typing
            await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms
            for (let i = 0; i < text.length; i++) {
                if (isCancelled)
                    return;
                setPlaceholder((prev) => prev + text[i]);
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        };
        const startTypingLoop = async () => {
            await typePrompt(prompts[current]);
            switchingInterval = setInterval(async () => {
                current = (current + 1) % prompts.length;
                await typePrompt(prompts[current]);
            }, 4000);
        };
        startTypingLoop();
        return () => {
            isCancelled = true;
            clearInterval(switchingInterval);
        };
    }, [selectedCategory]);
    const assessQueryQuality = async (query) => {
        const response = await fetch("/api/v1/query/assess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: query,
                category: selectedCategory,
                location: location || undefined
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to assess query quality");
        }
        return await response.json();
    };
    const generateFormulation = async (query) => {
        const response = await fetch("/api/v1/formulation/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: query,
                category: selectedCategory,
                location: location || undefined
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to generate formulation");
        }
        return await response.json();
    };
    const handleSubmit = async () => {
        if (typeof prompt !== "string" || prompt.trim().length === 0)
            return;
        setLoading(true);
        setShowQualityFeedback(false);
        setQueryQuality(null);
        try {
            // Step 1: Assess query quality (for feedback purposes)
            console.log("🔍 Assessing query quality...");
            const qualityAssessment = await assessQueryQuality(prompt);
            setQueryQuality(qualityAssessment);
            // Step 2: Always generate formulation (with quality warnings if needed)
            console.log("🚀 Generating formulation...");
            const formulation = await generateFormulation(prompt);
            onResult(formulation);
            // Step 3: Show quality feedback if query needs improvement
            if (qualityAssessment.needs_improvement) {
                setShowQualityFeedback(true);
            }
        }
        catch (err) {
            console.error("Error:", err);
            alert("🚨 Failed to process your request. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    const handleImprovedQuery = async (improvedQuery) => {
        setPrompt(improvedQuery);
        setShowQualityFeedback(false);
        setQueryQuality(null);
        // Retry with improved query
        setLoading(true);
        try {
            const formulation = await generateFormulation(improvedQuery);
            onResult(formulation);
        }
        catch (err) {
            console.error("Error:", err);
            alert("🚨 Failed to generate formulation. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center space-y-4 w-full max-w-xl transition-all", children: [_jsx("input", { className: "border border-gray-300 p-4 text-md rounded-lg shadow-sm w-full bg-white placeholder-gray-400\n                   focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-400 transition\n                   whitespace-nowrap overflow-hidden text-ellipsis", type: "text", placeholder: placeholder, value: prompt, onChange: (e) => setPrompt(e.target.value) }), _jsx("input", { className: "border border-gray-200 p-2 text-sm rounded-lg shadow-sm w-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition", type: "text", placeholder: "Enter your location (e.g. Mumbai, India)", value: location, onChange: (e) => setLocation(e.target.value) }), _jsx(Button, { onClick: handleSubmit, disabled: loading || !selectedCategory, className: "w-full text-lg px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition \n                   disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in zoom-in", children: loading ? "Processing..." : "Generate Formulation" }), showQualityFeedback && queryQuality && (_jsxs("div", { className: "w-full bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "font-semibold text-orange-800", children: ["\uD83D\uDD0D Query Quality: ", queryQuality.score, "/7"] }), _jsx("p", { className: "text-orange-700 text-sm", children: queryQuality.feedback })] }), _jsx("div", { className: "ml-4", children: _jsx("div", { className: "flex space-x-1", children: [1, 2, 3, 4, 5, 6, 7].map((score) => (_jsx("div", { className: `w-3 h-3 rounded-full ${score <= queryQuality.score
                                            ? 'bg-green-400'
                                            : 'bg-gray-300'}` }, score))) }) })] }), queryQuality.missing_elements && queryQuality.missing_elements.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-orange-800 font-medium text-sm mb-2", children: "\u274C Missing elements:" }), _jsx("ul", { className: "list-disc list-inside text-orange-700 text-sm space-y-1", children: queryQuality.missing_elements.map((element, index) => (_jsx("li", { children: element }, index))) })] })), _jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-orange-800 font-medium text-sm mb-2", children: "\uD83D\uDCA1 Suggestions to improve your query:" }), _jsx("ul", { className: "list-disc list-inside text-orange-700 text-sm space-y-1", children: queryQuality.suggestions.map((suggestion, index) => (_jsx("li", { children: suggestion }, index))) })] }), queryQuality.improvement_examples && queryQuality.improvement_examples.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-orange-800 font-medium text-sm mb-2", children: "\u2728 Try one of these improved queries:" }), _jsx("div", { className: "space-y-2", children: queryQuality.improvement_examples.map((example, index) => (_jsxs("button", { onClick: () => handleImprovedQuery(example), className: "w-full text-left p-3 bg-orange-100 hover:bg-orange-200 rounded text-orange-800 text-sm transition border border-orange-200", children: ["\uD83D\uDCA1 ", example] }, index))) })] })), queryQuality.formulation_warnings && queryQuality.formulation_warnings.length > 0 && (_jsxs("div", { className: "mt-3 p-3 bg-red-50 border border-red-200 rounded", children: [_jsx("p", { className: "text-red-800 font-medium text-sm mb-2", children: "\u26A0\uFE0F Important warnings:" }), _jsx("ul", { className: "list-disc list-inside text-red-700 text-sm space-y-1", children: queryQuality.formulation_warnings.map((warning, index) => (_jsx("li", { children: warning }, index))) })] }))] }))] }));
}

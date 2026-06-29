import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import ActiveContest from '../components/ActiveContest';

const TOPIC_OPTIONS = [
    { label: "Array", value: "array" },
    { label: "String", value: "string" },
    { label: "Hash Table", value: "hash-table" },
    { label: "Math", value: "math" },
    { label: "Sorting", value: "sorting" },
    { label: "Binary Search", value: "binary-search" },
    { label: "Two Pointers", value: "two-pointers" },
    { label: "Sliding Window", value: "sliding-window" },
    { label: "Prefix Sum", value: "prefix-sum" },
    { label: "Stack", value: "stack" },
    { label: "Queue", value: "queue" },
    { label: "Linked List", value: "linked-list" },
    { label: "Tree", value: "tree" },
    { label: "Graph", value: "graph" },
    { label: "Heap", value: "heap" },
    { label: "Greedy", value: "greedy" },
    { label: "Dynamic Programming", value: "dynamic-programming" },
    { label: "Backtracking", value: "backtracking" },
    { label: "Trie", value: "trie" },
    { label: "Bit Manipulation", value: "bit-manipulation" },
    { label: "Union-Find", value: "union-find" },
    { label: "Segment Tree", "value": "segment-tree" },
    { label: "Design", value: "design" },
    { label: "Simulation", value: "simulation" }
];

const DIFFICULTY_OPTIONS = [
    { label: "Easy", value: "Easy" },
    { label: "Medium", value: "Medium" },
    { label: "Hard", value: "Hard" }
];

// --- 🏆 Flawless Smart Dropdown ---
const CustomDropdown = ({ options, value, onChange, isDifficulty, widthClass = "w-32" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    
    // We need TWO refs now. One for the trigger box, one for the floating portal
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideInteraction = (event) => {
            // BUG FIX: Check if the scroll/click happened INSIDE the floating menu.
            // If it did, IGNORE it. Do not close the menu.
            if (menuRef.current && menuRef.current.contains(event.target)) {
                return;
            }
            // Ignore if clicking the trigger itself
            if (triggerRef.current && triggerRef.current.contains(event.target)) {
                return;
            }
            
            // If the user scrolls the main page or clicks outside, safely close it
            setIsOpen(false);
        };
        
        document.addEventListener('mousedown', handleOutsideInteraction);
        window.addEventListener('scroll', handleOutsideInteraction, true); 

        return () => {
            document.removeEventListener('mousedown', handleOutsideInteraction);
            window.removeEventListener('scroll', handleOutsideInteraction, true);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            
            // BUG FIX: Smart Collision Detection (Render Above or Below)
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const estimatedMenuHeight = 220; 

            // If there isn't enough space below, but there is space above -> Float ABOVE
            if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
                setMenuStyle({
                    position: 'fixed',
                    bottom: `${window.innerHeight - rect.top + 6}px`, // Anchors to the top of the input
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    zIndex: 99999
                });
            } else {
                // Normal behavior -> Float BELOW
                setMenuStyle({
                    position: 'fixed',
                    top: `${rect.bottom + 6}px`, // Anchors to the bottom of the input
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    zIndex: 99999
                });
            }
        }
        setIsOpen(!isOpen);
    };

    const getDifficultyColor = (val) => {
        if (!isDifficulty) return '';
        if (val === 'Easy') return 'text-[#00b8a3]';
        if (val === 'Medium') return 'text-[#ffc01e]';
        if (val === 'Hard') return 'text-[#ff375f]';
        return '';
    };

    return (
        <div className={`relative ${widthClass}`} ref={triggerRef}>
            <div
                onClick={toggleMenu}
                className="flex items-center justify-between cursor-pointer bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-[#333] transition-colors h-9 shadow-sm"
            >
                <span className={`font-semibold truncate ${isDifficulty ? getDifficultyColor(value) : 'text-gray-700 dark:text-gray-200'}`}>
                    {selectedOption.label}
                </span>
                
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>

            {isOpen && createPortal(
                <ul 
                    ref={menuRef}
                    style={menuStyle}
                    className="transition-all duration-200 ease-in flex flex-col rounded-lg p-2 overflow-y-auto max-h-[220px] focus:outline-none text-sm shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-white dark:bg-[#282828] border border-gray-100 dark:border-gray-700 custom-scrollbar"
                >
                    {options.map(opt => (
                        <li key={opt.value}>
                            <a
                                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
                                className="cursor-pointer select-none relative h-8 py-1.5 px-2 whitespace-nowrap hover:bg-gray-100 dark:hover:bg-[#333333] rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center"
                            >
                                <span className={`${isDifficulty ? getDifficultyColor(opt.value) : ''}`}>
                                    {opt.label}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>,
                document.body
            )}
        </div>
    );
};

export default function CustomContest() {
    const { theme, username } = useTheme();
    const [duration, setDuration] = useState('90');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedContest, setGeneratedContest] = useState(null);

    const [problems, setProblems] = useState([
        { difficulty: 'Easy', topic: 'array' },
        { difficulty: 'Medium', topic: 'hash-table' },
        { difficulty: 'Hard', topic: 'dynamic-programming' }
    ]);

    const handleDurationChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val !== '') {
            let num = parseInt(val, 10);
            if (num > 180) val = '180';
        }
        setDuration(val);
    };

    const handleDurationBlur = () => {
        if (duration === '' || parseInt(duration, 10) < 1) setDuration('1');
    };

    const handleAddProblem = () => {
        if (problems.length < 10) setProblems([...problems, { difficulty: 'Easy', topic: 'array' }]);
    };

    const handleRemoveProblem = (indexToRemove) => {
        if (problems.length > 3) setProblems(problems.filter((_, index) => index !== indexToRemove));
    };

    const updateProblem = (index, field, value) => {
        const newProblems = [...problems];
        newProblems[index][field] = value;
        setProblems(newProblems);
    };

    const generateContest = async () => {
        setIsLoading(true);
        setError(null);

        const payload = {
            username: username,
            durationMinutes: parseInt(duration, 10),
            problemCriteria: problems
        };

        try {
            const response = await fetch(`http://localhost:8080/api/contests/custom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            const data = await response.json();
            setTimeout(() => {
                setGeneratedContest(data);
                setIsLoading(false);
            }, 800);

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (generatedContest) {
        return <ActiveContest contestData={generatedContest} />;
    }

    if (isLoading) {
        return (
            <div className={`min-h-screen p-8 transition-colors duration-150 flex items-center justify-center ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#FAFAFA]'}`}>
                <div className="w-full max-w-4xl bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-800 animate-pulse">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="w-1/2">
                            <div className="h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded-md w-1/2"></div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="w-32 h-14 bg-gray-200 dark:bg-[#2a2a2a] rounded-xl"></div>
                        </div>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-800 mb-6" />
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3, 4].map((row) => (
                            <div key={row} className="flex items-center justify-between p-4 rounded-xl even:bg-gray-50 odd:bg-transparent dark:even:bg-[#252525] dark:odd:bg-transparent">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-6 h-6 rounded-full border-[2.5px] border-gray-300 dark:border-gray-600"></div>
                                    <div className="h-5 bg-gray-200 dark:bg-[#333333] rounded-md w-1/3"></div>
                                </div>
                                <div className="h-5 bg-gray-200 dark:bg-[#333333] rounded-md w-16"></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 text-center flex justify-center">
                        <div className="w-40 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl mx-auto px-4 min-h-[600px] font-sans">
            
            <div className="mb-6 md:mb-0 md:mr-12 flex-shrink-0 z-0">
                <Link
                    to="/"
                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-xl ${theme === 'dark'
                            ? 'bg-[#242424] text-gray-300 hover:text-white border border-gray-800'
                            : 'bg-white text-gray-600 hover:text-black border border-gray-200'
                        }`}
                >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back
                </Link>
            </div>

            {error && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center shadow-lg">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-4 font-bold hover:text-red-900">X</button>
                </div>
            )}

            <div className="relative w-full max-w-3xl mx-auto">
                <div className="flex flex-col justify-between h-[540px] w-full bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                    
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    Custom Arena
                                </h2>
                            </div>
                            
                            <div className="text-right flex items-center justify-end gap-3">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Duration</span>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={handleDurationChange}
                                    onBlur={handleDurationBlur}
                                    className="bg-gray-100 dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-inner font-bold w-[72px] text-center outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-800 mb-4" />

                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[270px] pr-2 custom-scrollbar">
                            {problems.map((prob, index) => (
                                
                                <div 
                                    key={index} 
                                    className="flex items-center justify-between p-3.5 h-[60px] rounded-xl even:bg-gray-50 odd:bg-transparent dark:even:bg-[#252525] dark:odd:bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="font-bold text-[15px] text-gray-400 dark:text-gray-500 w-6">#{index + 1}</span>
                                        
                                        <CustomDropdown 
                                            options={DIFFICULTY_OPTIONS}
                                            value={prob.difficulty}
                                            onChange={(val) => updateProblem(index, 'difficulty', val)}
                                            isDifficulty={true}
                                            widthClass="w-32"
                                        />

                                        <CustomDropdown 
                                            options={TOPIC_OPTIONS}
                                            value={prob.topic}
                                            onChange={(val) => updateProblem(index, 'topic', val)}
                                            isDifficulty={false}
                                            widthClass="flex-1 max-w-[200px]"
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleRemoveProblem(index)}
                                        disabled={problems.length <= 3}
                                        className={`p-2 rounded-full transition-colors ml-4 focus:outline-none ${problems.length <= 3 ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#3f2525]'}`}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
                        <button 
                            onClick={handleAddProblem}
                            disabled={problems.length >= 10}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${problems.length >= 10 ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-gray-100 dark:bg-[#252525] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300'}`}
                        >
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Problem
                        </button>

                        <button 
                            onClick={generateContest}
                            className="flex-1 max-w-[220px] bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Generate Contest
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
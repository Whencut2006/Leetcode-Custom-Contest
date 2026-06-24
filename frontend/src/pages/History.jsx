import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// --- SVG Icons ---
const GreenTick = () => (
    <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="check"
        className="absolute h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em] left-1/2 top-1/2"
        role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path fill="green" d="M441 103c9.4 9.4 9.4 24.6 0 33.9L177 401c-9.4 9.4-24.6 9.4-33.9 0L7 265c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l119 119L407 103c9.4-9.4 24.6-9.4 33.9 0z"></path>
    </svg>
);

const RedCross = () => (
    <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="xmark"
        className="absolute h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em] left-1/2 top-1/2"
        role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path fill="red" d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 210.7l105.4-105.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256l105.3 105.4z"></path>
    </svg>
);

export default function History() {
    const { theme, username } = useTheme();
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // 1. Derived State: Filter the data ONCE before rendering or calculating lengths
    const filteredHistory = historyData.filter(
        contest => contest.status === "COMPLETED" || contest.status === "ABANDONED"
    );

    // 2. Scroll Wheel Logic (Using filteredHistory bounds)
    const handleWheel = (e) => {
        if (e.deltaY > 30) {
            setActiveIndex(prev => Math.min(prev + 1, filteredHistory.length - 1));
        } else if (e.deltaY < -30) {
            setActiveIndex(prev => Math.max(prev - 1, 0));
        }
    };

    // 3. Keyboard Logic (Using filteredHistory bounds)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown' && activeIndex < filteredHistory.length - 1) {
                setActiveIndex(prev => prev + 1);
            } else if (e.key === 'ArrowUp' && activeIndex > 0) {
                setActiveIndex(prev => prev - 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, filteredHistory.length]);

    // 4. Data Fetching
    useEffect(() => {
        const fetchHistory = async () => {
            if (!username) return;
            try {
                const response = await fetch(`http://localhost:8080/api/contests/history/${username}`);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                const data = await response.json();
                setHistoryData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [username]);

    // --- RENDER BLOCKS ---

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-black dark:text-white">
                <svg className="animate-spin h-16 w-16 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="mt-4 text-2xl font-semibold">Loading...</p>
            </div>
        );
    }

    if (error !== null) {
        return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex w-3/4 h-24 overflow-hidden bg-[ivory] shadow-lg max-w-96 rounded-xl dark:bg-[ivory]">
                <svg xmlns="http://www.w3.org/2000/svg" height="96" width="16">
                    <path strokeLinecap="round" strokeWidth="2" stroke="indianred" fill="indianred" d="M 8 0 Q 4 4.8, 8 9.6 T 8 19.2 Q 4 24, 8 28.8 T 8 38.4 Q 4 43.2, 8 48 T 8 57.6 Q 4 62.4, 8 67.2 T 8 76.8 Q 4 81.6, 8 86.4 T 8 96 L 0 96 L 0 0 Z"></path>
                </svg>
                <div className="mx-2.5 overflow-hidden w-full">
                    <p className="mt-1.5 text-xl font-bold text-red-500 leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">Error !</p>
                    <p className="overflow-hidden leading-5 break-all text-red-500 max-h-10">{error}</p>
                </div>
                <button className="w-16 cursor-pointer focus:outline-none" onClick={() => setError(null)}>
                    <svg className="w-7 h-7" fill="none" stroke="indianred" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            className="relative h-[600px] w-full max-w-3xl mx-auto overflow-hidden flex items-center justify-center perspective-1000"
            onWheel={handleWheel}
        >
            {/* Map over the FILTERED history so the indices perfectly match the wheel math */}
            {filteredHistory.map((contest, index) => {

                const offset = index - activeIndex;

                if (Math.abs(offset) > 2) return null;

                const cardStyle = {
                    transform: `translateY(${offset * 140}px) scale(${1 - Math.abs(offset) * 0.15})`,
                    opacity: 1 - Math.abs(offset) * 0.4,
                    zIndex: 50 - Math.abs(offset),
                    pointerEvents: offset === 0 ? 'auto' : 'none',
                };

                return (
                    <div
                        key={contest.contestId}
                        style={cardStyle}
                        className="absolute w-full transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                    >
                        <div className="flex flex-col justify-between h-[480px] w-full bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800">

                            {/* --- TOP SECTION --- */}
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                            {contest.title}
                                        </h2>
                                        <span className="inline-block mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                                            {contest.contestType} CONTEST
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-inner">
                                            {contest.solvedProblems} / {contest.totalProblems} Solved
                                        </div>
                                        <div className="mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            {contest.status}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-200 dark:border-gray-800 mb-4" />

                                {/* 2. The Zebra-Striped Problem List */}
                                <div className="flex flex-col gap-1.5">
                                    {contest.contestProblems.map((problem) => (

                                        // The ENTIRE row is now the <a> tag with 'group' class
                                        <a
                                            key={problem.titleSlug}
                                            href={`https://leetcode.com/problems/${problem.titleSlug}/`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center justify-between p-3.5 rounded-xl even:bg-gray-50 odd:bg-transparent dark:even:bg-[#252525] dark:odd:bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-5 h-5 relative flex-shrink-0">
                                                    {problem.status === 'SOLVED' ? <GreenTick /> : <RedCross />}
                                                </div>

                                                <span className="font-semibold text-[15px] text-gray-800 dark:text-gray-200">
                                                    {problem.title}
                                                </span>
                                            </div>

                                            <span className={`text-sm font-bold ${problem.difficulty === 'Easy' ? 'text-[#00b8a3]' :
                                                    problem.difficulty === 'Medium' ? 'text-[#ffc01e]' :
                                                        'text-[#ff375f]'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </a>

                                    ))}
                                </div>
                            </div>

                            {/* --- BOTTOM SECTION --- */}
                            <div className="text-right text-gray-400 dark:text-gray-500 text-[13px] font-medium mt-4">
                                {contest.startedAt
                                    ? new Date(contest.startedAt).toLocaleString('en-US', {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                        year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
                                    })
                                    : 'Not Started'}
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}
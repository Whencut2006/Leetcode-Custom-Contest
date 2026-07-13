import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import GreenTick from '../components/ui/GreenTick';
import RedCross from '../components/ui/RedCross';
import { Link } from 'react-router-dom';

export default function History() {
    const { theme, username } = useTheme();
    const [historyData, setHistoryData] = useState([]);

    // Pagination State
    const [isLoading, setIsLoading] = useState(true); // For the massive skeleton
    const [isFetchingNext, setIsFetchingNext] = useState(false); // For the small circle loader
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const initialLoadRef = useRef(true); // Tracks if we used cache on boot
    const skipFetchRef = useRef(false);

    const filteredHistory = historyData.filter(
        contest => contest.status === "COMPLETED" || contest.status === "ABANDONED"
    );

    const handleWheel = (e) => {
        if (e.deltaY > 30) {
            setActiveIndex(prev => Math.min(prev + 1, filteredHistory.length - 1));
        } else if (e.deltaY < -30) {
            setActiveIndex(prev => Math.max(prev - 1, 0));
        }
    };

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

    // Pagination logic
    useEffect(() => {
        if (
            filteredHistory.length > 0 &&
            activeIndex >= filteredHistory.length - 3 &&
            hasMore &&
            !isFetchingNext &&
            !isLoading
        ) {
            setPage(prev => prev + 1);
        }
    }, [activeIndex, filteredHistory.length, hasMore, isFetchingNext, isLoading]);

    //fetch logic (pagination and cache)
    useEffect(() => {
        const fetchHistory = async () => {
            if (!username) return;

            // 1. Check Cache
            if (initialLoadRef.current && page === 0) {
                initialLoadRef.current = false;
                const cachedData = sessionStorage.getItem('lccc_history_cache');

                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);

                        // Fallback: Handle both the old array cache and our new object cache
                        let historyArray = [];
                        let cachedHasMore = false;

                        if (Array.isArray(parsed)) {
                            historyArray = parsed;
                            // If it's the old array, we guess if there's more based on multiples of 20
                            cachedHasMore = historyArray.length > 0 && historyArray.length % 20 === 0;
                        } else {
                            historyArray = parsed.data;
                            cachedHasMore = parsed.hasMore;
                        }

                        setHistoryData(historyArray);
                        setHasMore(cachedHasMore); // THE FIX: Sync the hasMore state!

                        const targetPage = Math.ceil(historyArray.length / 20) - 1;

                        if (targetPage > 0) {
                            skipFetchRef.current = true;
                            setPage(targetPage);
                        }

                        setIsLoading(false);
                        return; // Stop execution
                    } catch (error) {
                        sessionStorage.removeItem('lccc_history_cache');
                    }
                }
            }

            // 2. The Guard
            if (skipFetchRef.current) {
                skipFetchRef.current = false;
                return;
            }

            // 3. Normal Fetch
            try {
                if (page === 0) setIsLoading(true);
                else setIsFetchingNext(true);

                const response = await fetch(`http://localhost:8080/api/contests/history/${username}?page=${page}&size=20`);

                if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
                const data = await response.json();
                const newContests = data.content;

                setHistoryData(prevData => {
                    const combinedData = page === 0 ? newContests : [...prevData, ...newContests];

                    // THE UPGRADE: Store the data AND the hasMore boolean together
                    const cachePayload = {
                        data: combinedData,
                        hasMore: !data.last
                    };

                    try {
                        sessionStorage.setItem('lccc_history_cache', JSON.stringify(cachePayload));
                    } catch (storageError) {
                        if (storageError.name === 'QuotaExceededError') {
                            sessionStorage.removeItem('lccc_history_cache');
                            sessionStorage.setItem('lccc_history_cache', JSON.stringify(cachePayload));
                        }
                    }
                    return combinedData;
                });

                setHasMore(!data.last);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
                setIsFetchingNext(false);
            }
        };

        fetchHistory();
    }, [username, page]);

    // Skeleton UI
    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full max-w-5xl mx-auto px-4 min-h-[600px]">
                <div className="mr-6 md:mr-12 flex-shrink-0 z-50 opacity-50 pointer-events-none">
                    <div className="w-24 h-10 rounded-full bg-gray-200 dark:bg-[#2a2a2a] animate-pulse"></div>
                </div>
                <div className="relative h-[600px] w-full max-w-3xl mx-auto overflow-hidden flex items-center justify-center perspective-1000">
                    {[0, 1, 2].map((index) => {
                        const offset = index;
                        const cardStyle = {
                            transform: `translateY(${offset * 140}px) scale(${1 - Math.abs(offset) * 0.15})`,
                            opacity: 1 - Math.abs(offset) * 0.4,
                            zIndex: 50 - Math.abs(offset),
                        };
                        return (
                            <div key={`skeleton-${index}`} style={cardStyle} className="absolute w-full transition-all duration-500">
                                <div className="flex flex-col justify-between h-[480px] w-full bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6 border border-gray-300 dark:border-gray-800">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-1/2">
                                                <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg w-3/4 mb-3 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded-md w-1/3 animate-pulse"></div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-full w-24 mb-3 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded-md w-16 animate-pulse"></div>
                                            </div>
                                        </div>
                                        <hr className="border-gray-200 dark:border-gray-800 mb-4" />
                                        <div className="flex flex-col gap-1.5 overflow-hidden">
                                            {[1, 2, 3, 4].map((row) => (
                                                <div key={row} className="flex items-center justify-between p-3.5 rounded-xl even:bg-gray-100 odd:bg-transparent dark:even:bg-[#252525] dark:odd:bg-transparent">
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-[#333333] flex-shrink-0 animate-pulse"></div>
                                                        <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded-md w-2/3 animate-pulse"></div>
                                                    </div>
                                                    <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded-md w-12 animate-pulse"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded-md w-32 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (error !== null) {
        return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex w-3/4 h-24 overflow-hidden bg-[ivory] shadow-lg max-w-96 rounded-xl dark:bg-[ivory]">
                <svg xmlns="http://www.w3.org/2000/svg" height="96" width="16"><path strokeLinecap="round" strokeWidth="2" stroke="indianred" fill="indianred" d="M 8 0 Q 4 4.8, 8 9.6 T 8 19.2 Q 4 24, 8 28.8 T 8 38.4 Q 4 43.2, 8 48 T 8 57.6 Q 4 62.4, 8 67.2 T 8 76.8 Q 4 81.6, 8 86.4 T 8 96 L 0 96 L 0 0 Z"></path></svg>
                <div className="mx-2.5 overflow-hidden w-full">
                    <p className="mt-1.5 text-xl font-bold text-red-500 leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">Error !</p>
                    <p className="overflow-hidden leading-5 break-all text-red-500 max-h-10">{error}</p>
                </div>
                <button className="w-16 cursor-pointer focus:outline-none" onClick={() => setError(null)}>
                    <svg className="w-7 h-7" fill="none" stroke="indianred" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full max-w-5xl mx-auto px-4">
            <div className="mr-6 md:mr-12 flex-shrink-0 z-50">
                <Link to="/" className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-xl ${theme === 'dark' ? 'bg-[#242424] text-gray-300 hover:text-white border border-gray-800' : 'bg-white text-gray-600 hover:text-black border border-gray-200'}`}>
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back
                </Link>
            </div>

            {/* The Main Container */}
            <div className="relative h-[600px] w-full max-w-3xl mx-auto overflow-hidden flex items-center justify-center perspective-1000" onWheel={handleWheel}>

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
                        <div key={contest.contestId} style={cardStyle} className="absolute w-full transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]">
                            <div className="flex flex-col justify-between h-[480px] w-full bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{contest.title}</h2>
                                            <span className="inline-block mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">{contest.contestType} CONTEST</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-inner">
                                                {contest.solvedProblems} / {contest.totalProblems} Solved
                                            </div>
                                            <div className="mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{contest.status}</div>
                                        </div>
                                    </div>
                                    <hr className="border-gray-200 dark:border-gray-800 mb-4" />
                                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[280px] pr-2 pb-2 custom-scrollbar">
                                        {contest.contestProblems.map((problem) => (
                                            <a key={problem.titleSlug} href={`https://leetcode.com/problems/${problem.titleSlug}/`} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3.5 rounded-xl even:bg-gray-100 odd:bg-transparent dark:even:bg-[#252525] dark:odd:bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-[#2f2f2f]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-7 h-7 text-xl relative flex-shrink-0">
                                                        {problem.status === 'SOLVED' ? <GreenTick /> : <RedCross />}
                                                    </div>
                                                    <span className="font-semibold text-[15px] text-gray-800 dark:text-gray-200">{problem.title}</span>
                                                </div>
                                                <span className={`text-sm font-bold ${problem.difficulty === 'Easy' ? 'text-[#00b8a3]' : problem.difficulty === 'Medium' ? 'text-[#ffc01e]' : 'text-[#ff375f]'}`}>{problem.difficulty}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right text-gray-400 dark:text-gray-500 text-[13px] font-medium mt-4">
                                    {contest.startedAt ? new Date(contest.startedAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Not Started'}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isFetchingNext && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2a2a2a] p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                        <svg className="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
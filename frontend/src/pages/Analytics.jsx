import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Gorgeous Color Palette for the Donut Chart
const DONUT_COLORS = ['#00b8a3', '#ffc01e', '#8a2be2', '#ff375f', '#3b82f6'];

export default function Analytics() {
    const { theme, username } = useTheme();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for the Donut Chart Pop-up Modal
    const [selectedMacro, setSelectedMacro] = useState(null);

    const initialLoadRef = useRef(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!username) return;

            if (initialLoadRef.current) {
                initialLoadRef.current = false;
                const cachedData = sessionStorage.getItem('lccc_analytics_cache');

                if (cachedData) {
                    try {
                        setAnalytics(JSON.parse(cachedData));
                        setIsLoading(false);
                        return;
                    } catch (error) {
                        sessionStorage.removeItem('lccc_analytics_cache');
                    }
                }
            }

            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:8080/api/analytics/${username}`);
                
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                
                const data = await response.json();
                setAnalytics(data);

                try {
                    sessionStorage.setItem('lccc_analytics_cache', JSON.stringify(data));
                } catch (storageError) {
                    if (storageError.name === 'QuotaExceededError') {
                        sessionStorage.removeItem('lccc_analytics_cache');
                        sessionStorage.setItem('lccc_analytics_cache', JSON.stringify(data));
                    }
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [username]);

    // Custom Tooltip for the Radar Chart to match our Dark/Light theme
    const CustomRadarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-xl">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{payload[0].payload.macroName}</p>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">Elo Rating: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

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

    if (isLoading) {
        return (
            <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-8 min-h-[600px]">
                <div className="w-24 h-10 rounded-full bg-gray-200 dark:bg-[#2a2a2a] animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-md">
                            <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
                            <div className="h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded-xl w-1/3 mx-auto animate-pulse"></div>
                        </div>
                    ))}
                </div>
                <div className="h-96 w-full bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl animate-pulse"></div>
            </div>
        );
    }

    if (!analytics) return null;

    // Filter out macro topics with 0 solves for a cleaner Pie Chart
    const pieChartData = analytics.macroTopics.filter(m => m.totalMacroSolvedCount > 0);

    return (
        <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-8 min-h-screen relative">
            
            {/* The Header & Back Button */}
            <div className="flex justify-between items-center mb-8">
                <Link to="/" className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-xl ${theme === 'dark' ? 'bg-[#242424] text-gray-300 hover:text-white border border-gray-800' : 'bg-white text-gray-600 hover:text-black border border-gray-200'}`}>
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back
                </Link>

                <div className="text-right">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Performance</h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Rating: <span className="text-blue-600 dark:text-blue-400">{analytics.overallElo} Elo</span>
                    </p>
                </div>
            </div>

            {/* TIER 1: Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-colors">
                    <span className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2">Contests Taken</span>
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{analytics.totalContestsAttended}</span>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-lg p-6 border border-blue-200 dark:border-blue-900/50 flex flex-col items-center justify-center transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 dark:bg-blue-600"></div>
                    <span className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2">MAANG Readiness</span>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{analytics.maangReadiness}</span>
                        <span className="text-xl font-bold text-gray-500 dark:text-gray-400">%</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-colors">
                    <span className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2">Problems Solved</span>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-black text-[#00b8a3]">{analytics.totalProblemsSolved}</span>
                        <span className="text-xl font-bold text-gray-400 dark:text-gray-500">/ {analytics.totalProblemsAttended}</span>
                    </div>
                </div>
            </div>

            {/* TIER 2: The Core Visuals (Radar & Donut) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                
                {/* Left Side: The Macro Skill Web */}
                <div className="col-span-3 bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors flex flex-col items-center">
                    <h3 className="text-sm font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4 w-full text-center">Skill Web</h3>
                    <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analytics.macroTopics}>
                                <PolarGrid stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
                                <PolarAngleAxis dataKey="macroName" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[800, 2200]} tick={false} axisLine={false} />
                                <RechartsTooltip content={<CustomRadarTooltip />} />
                                <Radar name="Elo" dataKey="averageElo" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Side: The Solve Distribution Donut */}
                <div className="col-span-2 bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors flex flex-col items-center relative">
                    <h3 className="text-sm font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4 w-full text-center">Solve Distribution</h3>
                    <div className="w-full h-64 cursor-pointer">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="totalMacroSolvedCount"
                                        onClick={(data, index) => setSelectedMacro(pieChartData[index])}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} className="hover:opacity-80 transition-opacity duration-300 outline-none" />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: theme === 'dark' ? 'white' : 'black', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">No solves yet.</div>
                        )}
                    </div>
                    {/* Tiny instructional text */}
                    <p className="text-xs text-gray-400 absolute bottom-4 w-full text-center animate-pulse">Click a slice to drill down</p>
                </div>
            </div>

            {/* TIER 3: The Actionable Diagnosis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Top 3 Strongest */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                    <h3 className="text-sm font-bold tracking-widest text-green-600 dark:text-green-500 uppercase mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        Strongest Micro-Topics
                    </h3>
                    <div className="flex flex-col gap-3">
                        {analytics.top3StrongTopics.map((topic, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-[#252525]">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{topic.topicName}</span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">{topic.elo} Elo</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top 3 Weakest */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                    <h3 className="text-sm font-bold tracking-widest text-red-500 uppercase mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Critical Vulnerabilities
                    </h3>
                    <div className="flex flex-col gap-3">
                        {analytics.top3WeakTopics.map((topic, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-[#252525]">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{topic.topicName}</span>
                                <span className="text-sm font-bold text-red-500">{topic.elo} Elo</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* THE MODAL: Donut Chart Drill-Down */}
            {selectedMacro && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{selectedMacro.macroName}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{selectedMacro.totalMacroSolvedCount} Total Solves</p>
                            </div>
                            <button 
                                onClick={() => setSelectedMacro(null)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors text-gray-500 dark:text-gray-400"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Content (The 24 Topics) */}
                        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-2">
                            {selectedMacro.subtopics.map((sub, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors group">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[15px] text-gray-800 dark:text-gray-200">{sub.topicName}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Solved: {sub.solvedCount}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${sub.elo > 1500 ? 'text-green-500' : sub.elo < 1000 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {sub.elo} Elo
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
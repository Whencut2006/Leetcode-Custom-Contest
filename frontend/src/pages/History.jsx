import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function History() {
    const { theme, username } = useTheme();
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [username]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-black dark:text-white">
                <svg
                    className="animate-spin h-16 w-16 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>

                <p className="mt-4 text-2xl font-semibold">
                    Loading...
                </p>
            </div>
        )
    }
    if (error !== null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-8 bg-red-100 border-2 border-red-400 text-red-700 rounded-2xl text-center text-3xl font-semibold max-w-xl w-full mx-4 shadow-lg">
                    {error}
                </div>
            </div>
        )
    }
    return (
        <>
            <div className='card-holder'>

            </div>
        </>
    );
}
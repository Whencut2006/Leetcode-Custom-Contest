import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function ActiveContest({ contestData }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // ==========================================
  // /// NEW ABSOLUTE TIME LOGIC ///
  // ==========================================

  // 1. Initialize Lobby State
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('LCCC_STARTED') === 'true';
  });

  // 2. Fetch the target End Time from memory (if it exists)
  const [endTime, setEndTime] = useState(() => {
    const savedEnd = localStorage.getItem('LCCC_END_TIME');
    return savedEnd ? parseInt(savedEnd, 10) : null;
  });

  // 3. Calculate initial Time Left purely based on the absolute End Time vs NOW
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEnd = localStorage.getItem('LCCC_END_TIME');
    if (savedEnd) {
      const remainingSeconds = Math.floor((parseInt(savedEnd, 10) - Date.now()) / 1000);
      return remainingSeconds > 0 ? remainingSeconds : 0;
    }
    return 90 * 60; // Default 90 minutes if not started
  });

  // 4. The Bulletproof Interval Timer
  useEffect(() => {
    if (!hasStarted || !endTime || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      // Calculate real-time difference every second
      const remainingSeconds = Math.floor((endTime - Date.now()) / 1000);

      if (remainingSeconds <= 0) {
        setTimeLeft(0);
        clearInterval(timerId);
        // (Optional Future Addition: Auto-submit the contest to backend here when time is 0)
      } else {
        setTimeLeft(remainingSeconds);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [hasStarted, endTime, timeLeft]);

  // ==========================================

  const handleStartContest = async () => {
    try {
      await fetch(`http://localhost:8080/api/contests/${contestData.contestId}/status?status=IN_PROGRESS`, {
        method: 'PUT'
      });

      // Calculate absolute end time (Now + 90 mins)
      const targetEndTime = Date.now() + (90 * 60 * 1000);

      // Save state to memory
      localStorage.setItem('LCCC_STARTED', 'true');
      localStorage.setItem('LCCC_END_TIME', targetEndTime.toString());

      // Update React State
      setEndTime(targetEndTime);
      setHasStarted(true);
      setTimeLeft(90 * 60);

    } catch (error) {
      console.error("Failed to start contest on backend", error);
    }
  };

  const handleQuitContest = async () => {
    try {
      if (hasStarted) {
        await fetch(`http://localhost:8080/api/contests/${contestData.contestId}/status?status=ABANDONED`, {
          method: 'PUT'
        });
      }

      // Wipe the memory clean (Notice we wipe LCCC_END_TIME now)
      localStorage.removeItem('LCCC_DATA');
      localStorage.removeItem('LCCC_END_TIME');
      localStorage.removeItem('LCCC_STARTED');

      navigate('/');
    } catch (error) {
      console.error("Failed to quit contest", error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-[#00b8a3]';
      case 'medium': return 'text-[#ffc01e]';
      case 'hard': return 'text-[#ff375f]';
      default: return 'text-gray-500';
    }
  };

  if (!contestData || !contestData.problems) return null;

  return (
    <div className={`min-h-screen p-8 transition-colors duration-150 ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#FAFAFA]'
    }`}>
      <div className="max-w-4xl mx-auto">

        {/* Header Area */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div>
            <h1 className={`text-3xl font-bold capitalize mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {contestData.company || contestData.title} Assessment
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {hasStarted
                ? timeLeft === 0
                  ? "Time is up! The contest has ended."
                  : "Contest is live! Complete all 4 problems before the timer expires."
                : "Your problems are ready. Start the timer when you are ready to begin."}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col items-end">
            {!hasStarted ? (
              <button
                onClick={handleStartContest}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-md transition-all transform hover:scale-105"
              >
                Start Contest
              </button>
            ) : (
              <div className={`px-6 py-3 rounded-lg font-mono text-3xl font-bold shadow-sm transition-colors ${
                theme === 'dark' ? 'bg-[#242424] border border-gray-800' : 'bg-white border border-gray-200'
              } ${timeLeft < 300 ? 'text-red-500 animate-pulse' : theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* Problem List */}
        <div className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          {contestData.problems.map((problem, index) => {
            const rowContent = (
              <>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold mb-1">
                    {index + 1}. {problem.title}
                  </span>
                  <span className={`text-sm font-bold tracking-wide ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-end w-12">
                  {problem.status === 'SOLVED' && (
                    <div className="relative w-8 h-8 text-green-500">
                      <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="circle" className="svg-inline--fa fa-circle absolute h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em] left-1/2 top-1/2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </>
            );

            // Row logic updated: If time is up (0), they can no longer click the links!
            const isRowActive = hasStarted && timeLeft > 0;
            const rowClasses = `flex items-center justify-between p-5 transition-all block w-full
              odd:bg-[#FFFFFF] even:bg-[#FAFAFA]
              dark:odd:bg-[#1A1A1A] dark:even:bg-[#272727] dark:text-white
              ${!isRowActive ? 'opacity-80' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}
            `;

            return isRowActive ? (
              <a
                key={index}
                href={`https://leetcode.com/problems/${problem.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClasses}
                style={{ textDecoration: 'none' }}
              >
                {rowContent}
              </a>
            ) : (
              <div key={index} className={rowClasses}>
                {rowContent}
              </div>
            );
          })}
        </div>

        {/* Quit Contest Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleQuitContest}
            className={`px-8 py-3 text-lg font-bold rounded-xl transition-colors focus:outline-none shadow-sm ${
              theme === 'dark'
                ? 'bg-[#2a2a2a] text-red-400 hover:bg-[#333333]'
                : 'bg-gray-200 text-red-600 hover:bg-gray-300'
            }`}
          >
            Quit Contest
          </button>
        </div>

      </div>
    </div>
  );
}
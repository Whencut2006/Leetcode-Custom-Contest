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
        // destroying cache on natural timeout
        sessionStorage.removeItem('lccc_history_cache');
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
      sessionStorage.removeItem('lccc_history_cache');

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
    <div className={`min-h-screen p-8 transition-colors duration-150 flex items-center justify-center ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#FAFAFA]'
      }`}>

      {/* THE PREMIUM CARD WRAPPER */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-800">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-extrabold capitalize mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {contestData.company || contestData.title} Assessment
            </h1>
            <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-1 hover:shadow-lg"
              >
                Start Contest
              </button>
            ) : (
              <div className={`px-6 py-3 rounded-xl font-mono text-3xl font-bold shadow-inner transition-colors ${theme === 'dark' ? 'bg-[#252525] border border-gray-700' : 'bg-gray-50 border border-gray-200'
                } ${timeLeft < 300 ? 'text-red-500 animate-pulse' : theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* The Divider */}
        <hr className="border-gray-200 dark:border-gray-800 mb-6" />

        {/* LEETCODE STYLE PROBLEM LIST (Now with Internal Scroll) */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[350px] pr-2 pb-2 custom-scrollbar">
          {contestData.problems.map((problem, index) => {

            const isRowActive = hasStarted && timeLeft > 0;

            // LeetCode Zebra Striping + Hover effects
            const rowClasses = `group flex items-center justify-between p-4 rounded-xl transition-colors w-full
              even:bg-gray-50 odd:bg-transparent dark:even:bg-[#252525] dark:odd:bg-transparent
              ${isRowActive ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2f2f2f]' : 'opacity-60 cursor-not-allowed'}
            `;

            const rowContent = (
              <>
                {/* Left Side: Icon + Title */}
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    {problem.status === 'SOLVED' ? (
                      <div className="text-green-500">
                        <svg aria-hidden="true" focusable="false" className="w-5 h-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                          <path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"></path>
                        </svg>
                      </div>
                    ) : (
                      // Empty circle for pending problems (Keeps title perfectly aligned)
                      <div className="w-5 h-5 rounded-full border-[2.5px] border-gray-300 dark:border-gray-600"></div>
                    )}
                  </div>
                  <span className={`font-semibold text-[16px] transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    } ${isRowActive && 'group-hover:text-white-500 dark:group-hover:text-white-400'}`}
                  >
                    {index + 1}. {problem.title}
                  </span>
                </div>

                {/* Right Side: Exact LeetCode Difficulty Colors */}
                <span className={`text-sm font-bold ${problem.difficulty === 'Easy' ? 'text-[#00b8a3]' :
                    problem.difficulty === 'Medium' ? 'text-[#ffc01e]' :
                      'text-[#ff375f]'
                  }`}>
                  {problem.difficulty}
                </span>
              </>
            );

            return isRowActive ? (
              <a
                key={index}
                href={`https://leetcode.com/problems/${problem.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClasses}
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

        {/* Exit Contest Button */}
        <div className="mt-10 text-center">
          <button
            onClick={handleQuitContest}
            className={`px-8 py-2.5 text-sm font-bold tracking-wide uppercase rounded-xl transition-all shadow-sm hover:shadow-md ${theme === 'dark'
                ? 'bg-[#2a2a2a] text-red-400 hover:bg-[#333333]'
                : 'bg-gray-100 text-red-600 hover:bg-gray-200'
              }`}
          >
            Exit Contest
          </button>
        </div>

      </div>
    </div>
  );
}
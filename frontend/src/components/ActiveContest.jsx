import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useStatusPoller } from '../hooks/useStatusPoller';
import GreenTick from './ui/GreenTick';

export default function ActiveContest({ contestData }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // 1. Initialize State
  const [hasStarted, setHasStarted] = useState(() => localStorage.getItem('LCCC_STARTED') === 'true');
  const [endTime, setEndTime] = useState(() => {
    const savedEnd = localStorage.getItem('LCCC_END_TIME');
    return savedEnd ? parseInt(savedEnd, 10) : null;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEnd = localStorage.getItem('LCCC_END_TIME');
    if (savedEnd) {
      const remainingSeconds = Math.floor((parseInt(savedEnd, 10) - Date.now()) / 1000);
      return remainingSeconds > 0 ? remainingSeconds : 0;
    }
    return 90 * 60;
  });

  // 2. Setup Data for Status Poller
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('user');
  const contestSlugs = contestData?.problems ? contestData.problems.map(p => ({ titleSlug: p.titleSlug })) : [];
  const startTime = endTime ? endTime - (90 * 60 * 1000) : null;

  // 3. Fire up the Engine
  const { solvedProblemSlugs, forcePoll } = useStatusPoller(username, startTime, contestSlugs, timeLeft);

  // 4. Bulletproof Interval Timer
  useEffect(() => {
    if (!hasStarted || !endTime || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      const remainingSeconds = Math.floor((endTime - Date.now()) / 1000);

      if (remainingSeconds <= 0) {
        setTimeLeft(0);
        clearInterval(timerId);
        handleSubmitContest(true);
      } else {
        setTimeLeft(remainingSeconds);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [hasStarted, endTime, timeLeft]);

  const handleStartContest = async () => {
    try {
      await fetch(`http://localhost:8080/api/contests/${contestData.contestId}/status?status=IN_PROGRESS`, {
        method: 'PUT'
      });

      const targetEndTime = Date.now() + (90 * 60 * 1000);

      localStorage.setItem('LCCC_STARTED', 'true');
      localStorage.setItem('LCCC_END_TIME', targetEndTime.toString());

      setEndTime(targetEndTime);
      setHasStarted(true);
      setTimeLeft(90 * 60);
    } catch (error) {
      console.error("Failed to start contest on backend", error);
    }
  };

  const handleSubmitContest = async (isTimeout = false) => {
    try {
      console.log(isTimeout ? "Timer hit zero! Auto-submitting..." : "User manually ending contest. Forcing final poll...");


      const finalSolvedSlugs = await forcePoll() || solvedProblemSlugs;
      const finalScore = finalSolvedSlugs.length;

      if (hasStarted) {
        // 2. THE FIX: Send the actual score and COMPLETED status to Spring Boot
        // Note: You must ensure your Spring Boot controller accepts this payload!
        await fetch(`http://localhost:8080/api/contests/${contestData.contestId}/submit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            solvedSlugs: finalSolvedSlugs // Optional: send the array if your backend tracks which specific ones were solved
          })
        });
      }

      // 3. Clean up memory
      localStorage.removeItem('LCCC_DATA');
      localStorage.removeItem('LCCC_END_TIME');
      localStorage.removeItem('LCCC_STARTED');

      // 4. Destroy Cache
      sessionStorage.removeItem('lccc_history_cache');

      // 5. Redirect
      navigate('/');
    } catch (error) {
      console.error("Failed to submit contest", error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!contestData || !contestData.problems) return null;

  return (
    <div className={`min-h-screen p-8 transition-colors duration-150 flex items-center justify-center ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#FAFAFA]'}`}>
      <div className="w-full max-w-4xl bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-extrabold capitalize mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {contestData.company || contestData.title} Assessment
            </h1>
            <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {hasStarted
                ? timeLeft === 0 ? "Time is up! The contest has ended." : "Contest is live! Complete all problems before the timer expires."
                : "Your problems are ready. Start the timer when you are ready to begin."}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col items-end">
            {!hasStarted ? (
              <button onClick={handleStartContest} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-1 hover:shadow-lg">
                Start Contest
              </button>
            ) : (
              <div className={`px-6 py-3 rounded-xl font-mono text-3xl font-bold shadow-inner transition-colors ${theme === 'dark' ? 'bg-[#252525] border border-gray-700' : 'bg-gray-50 border border-gray-200'} ${timeLeft < 300 ? 'text-red-500 animate-pulse' : theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-800 mb-6" />

        {/* Problem List */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[350px] pr-2 pb-2 custom-scrollbar">
          {contestData.problems.map((problem, index) => {
            const isRowActive = hasStarted && timeLeft > 0;
            const rowClasses = `group flex items-center justify-between p-4 rounded-xl transition-colors w-full even:bg-gray-50 odd:bg-transparent dark:even:bg-[#252525] dark:odd:bg-transparent ${isRowActive ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2f2f2f]' : 'opacity-60 cursor-not-allowed'}`;

            const rowContent = (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    {/* Status Poller UI Integration */}
                    {solvedProblemSlugs.includes(problem.titleSlug) ? (
                      <GreenTick />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-[2.5px] border-gray-300 dark:border-gray-600"></div>
                    )}
                  </div>
                  <span className={`font-semibold text-[16px] transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} ${isRowActive && 'group-hover:text-white-500 dark:group-hover:text-white-400'}`}>
                    {index + 1}. {problem.title}
                  </span>
                </div>

                <span className={`text-sm font-bold ${problem.difficulty === 'Easy' ? 'text-[#00b8a3]' : problem.difficulty === 'Medium' ? 'text-[#ffc01e]' : 'text-[#ff375f]'}`}>
                  {problem.difficulty}
                </span>
              </>
            );

            return isRowActive ? (
              <a key={index} href={`https://leetcode.com/problems/${problem.titleSlug}/`} target="_blank" rel="noopener noreferrer" className={rowClasses}>
                {rowContent}
              </a>
            ) : (
              <div key={index} className={rowClasses}>
                {rowContent}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button onClick={() => handleSubmitContest(false)} className={`px-8 py-2.5 text-sm font-bold tracking-wide uppercase rounded-xl transition-all shadow-sm hover:shadow-md ${theme === 'dark' ? 'bg-[#2a2a2a] text-red-400 hover:bg-[#333333]' : 'bg-gray-100 text-red-600 hover:bg-gray-200'}`}>
            Finish & Submit
          </button>
        </div>

      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { theme } = useTheme();

  // --- MINIMALIST STYLES ---
  // ZERO floating, ZERO massive shadows. Just smooth, grounded color transitions.
  const cardClass = `group block p-6 rounded-xl border transition-colors duration-200 ${
    theme === "dark"
      ? "bg-[#242424] border-gray-800 hover:bg-[#2c2c2c] hover:border-gray-600"
      : "bg-white border-gray-200 hover:bg-[#fafafa] hover:border-gray-300"
  }`;

  const titleClass = `text-lg font-semibold transition-colors duration-200 ${
    theme === "dark" ? "text-gray-100 group-hover:text-white-400" : "text-[#262626] group-hover:text-white-500"
  }`;

  const descClass = `text-sm leading-relaxed mt-3 ${
    theme === "dark" ? "text-gray-400" : "text-gray-500"
  }`;

  // Optional: A tiny arrow that slides right on hover, keeping the card itself completely still.
  const arrowClass = `w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1 ${
    theme === 'dark' ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-500'
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 transition-colors duration-150 ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#FAFAFA]'
    }`}>
      <div className="w-full max-w-4xl py-12">

        {/* Platform Header Area (Restored to your exact sizing) */}
        <div className="mb-10 text-center">
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${
            theme === "dark" ? "text-white" : "text-[#262626]"
          }`}>
            Custom Contest Control Hub
          </h1>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Module 1: Custom Contest */}
          <Link to="/custom-contest" className={cardClass}>
            <div className="flex items-center justify-between">
              <span className={titleClass}>Custom Contest Builder</span>
              <svg className={arrowClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
            <p className={descClass}>
              Configure dynamic problems matching targeted rating indices and technical topics with customized structural timer limits.
            </p>
          </Link>

          {/* Module 2: Company Contest */}
          <Link to="/company-contest" className={cardClass}>
            <div className="flex items-center justify-between">
              <span className={titleClass}>Company Assessments</span>
              <svg className={arrowClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
            <p className={descClass}>
              Test interview configurations across 5 distinct target operational pools totaling 20 dedicated technical problem constraints.
            </p>
          </Link>

          {/* Module 3: Analytics */}
          <Link to="/analytics" className={cardClass}>
            <div className="flex items-center justify-between">
              <span className={titleClass}>Analytics Dashboard</span>
              <svg className={arrowClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
            <p className={descClass}>
              Extract multi-device relational tracking indicators mapping structural domain tracking variables and behavioral error summaries.
            </p>
          </Link>

          {/* Module 4: History */}
          <Link to="/history" className={cardClass}>
            <div className="flex items-center justify-between">
              <span className={titleClass}>Contest History Logs</span>
              <svg className={arrowClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
            <p className={descClass}>
              Review comprehensive terminal operational executions tracking complete chronological challenge sessions and table states.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}
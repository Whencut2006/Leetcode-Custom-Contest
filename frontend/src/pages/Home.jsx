import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { theme } = useTheme();
  return (
    /* --- FIXED 1: Main canvas scales background color dynamically --- */
    <div className={`min-h-screen flex items-center justify-center px-6 transition-colors duration-150 ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#FAFAFA]'
    }`}>
      <div className="w-full max-w-4xl py-12">

        {/* Platform Header Panel Area */}
        <div className="mb-10 text-center">
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${
            theme === "dark" ? "text-white" : "text-[#262626]"
          }`}>
            Custom Contest Control Hub
          </h1>
        </div>

        {/* 2x2 Grid Layout Wrapper — FIXED 2: Background removed from wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Module 1: Custom Contest */}
          <Link
            to="/custom-contest"
            className={`group block p-6 rounded-xl transition-all duration-100 shadow-sm border ${
              theme === "dark"
                ? "bg-[#242424] border-gray-800 hover:bg-[#2c2c2c] hover:border-gray-700"
                : "bg-white border-gray-200 hover:bg-[#f5f5f5] hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-[#262626]"}`}>
                Custom Contest Builder
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Configure dynamic problems matching targeted rating indices and technical topics with customized structural timer limits.
            </p>
          </Link>

          {/* Module 2: Company Contest */}
          <Link
            to="/company-contest"
            className={`group block p-6 rounded-xl transition-all duration-100 shadow-sm border ${
              theme === "dark"
                ? "bg-[#242424] border-gray-800 hover:bg-[#2c2c2c] hover:border-gray-700"
                : "bg-white border-gray-200 hover:bg-[#f5f5f5] hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-[#262626]"}`}>
                Company Assessments
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Test interview configurations across 5 distinct target operational pools totaling 20 dedicated technical problem constraints.
            </p>
          </Link>

          {/* Module 3: Analytics */}
          <Link
            to="/analytics"
            className={`group block p-6 rounded-xl transition-all duration-100 shadow-sm border ${
              theme === "dark"
                ? "bg-[#242424] border-gray-800 hover:bg-[#2c2c2c] hover:border-gray-700"
                : "bg-white border-gray-200 hover:bg-[#f5f5f5] hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-[#262626]"}`}>
                Analytics Dashboard
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Extract multi-device relational tracking indicators mapping structural domain tracking variables and behavioral error summaries.
            </p>
          </Link>

          {/* Module 4: History */}
          <Link
            to="/history"
            className={`group block p-6 rounded-xl transition-all duration-100 shadow-sm border ${
              theme === "dark"
                ? "bg-[#242424] border-gray-800 hover:bg-[#2c2c2c] hover:border-gray-700"
                : "bg-white border-gray-200 hover:bg-[#f5f5f5] hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-[#262626]"}`}>
                Contest History Logs
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Review comprehensive terminal operational executions tracking complete chronological challenge sessions and table states.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}
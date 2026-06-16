import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ActiveContest from '../components/ActiveContest';
import { Link } from 'react-router-dom';

// The 9 Target Companies with crisp, algorithmic-focused descriptions
const companies = [
  { id: 'adobe', name: 'Adobe', desc: 'A leading software company known for creative, design, and digital experience solutions.' },
  { id: 'amazon', name: 'Amazon', desc: 'A global technology company specializing in e-commerce, cloud computing, and AI services.' },
  { id: 'apple', name: 'Apple', desc: 'A technology company renowned for premium consumer electronics, software, and services.' },
  { id: 'bloomberg', name: 'Bloomberg', desc: 'A financial technology and media company providing market data, analytics, and news.' },
  { id: 'google', name: 'Google', desc: 'A technology company best known for its search engine, cloud services, and AI innovations.' },
  { id: 'meta', name: 'Meta', desc: 'A technology company that operates major social media platforms and develops virtual reality products.' },
  { id: 'microsoft', name: 'Microsoft', desc: 'A global software and cloud computing company known for Windows, Office, and Azure.' },
  { id: 'netflix', name: 'Netflix', desc: 'Tackle highly-available caching and streaming algorithms.' },
  { id: 'uber', name: 'Uber', desc: 'Navigate complex pathfinding algorithms and geospatial matrices.' }
];
const getImageUrl = (imageName) => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL(`ui/images/${imageName}`);
  }
  // If testing locally on Vite dev server (localhost:5173)
  return `/images/${imageName}`;
};

export default function CompanyContest() {
  const { theme, username } = useTheme();

  // States
  const [loadingCompany, setLoadingCompany] = useState(null); // Tracks which specific card is loading
  const [error, setError] = useState(null);
  const [activeContestData, setActiveContestData] = useState(null);


  const handleStartContest = async (companyId) => {
    setLoadingCompany(companyId);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/contests/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyId,
          username: username
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to generate ${companyId} contest`);
      }

      const data = await response.json();
      setActiveContestData(data); // Transition to Active Contest UI

    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCompany(null);
    }
  };

  // If a contest is generated, render the Timer Dashboard
  if (activeContestData) {
    return <ActiveContest contestData={activeContestData} />;
  }

  // Otherwise, render the 3x3 Grid UI
  return (
    <div className={`min-h-screen py-12 px-6 transition-colors duration-150 ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#FAFAFA]'
    }`}>
      <div className="max-w-6xl mx-auto">

        {/* Header & Back Button */}
        <div className="mb-10 text-center relative">
          <Link to="/" className={`absolute left-0 top-2 text-sm font-medium transition-colors ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
          }`}>
            &larr; Back
          </Link>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#262626]'}`}>
            Company Assessments
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Select a target company to begin a specialized 90-minute technical evaluation.
          </p>
        </div>

        {/* Global Error Banner (if API fails) */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center font-medium max-w-2xl mx-auto shadow-sm">
            {error}
          </div>
        )}

        {/* 3x3 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className={`flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 shadow-sm ${
                theme === 'dark'
                  ? 'bg-[#242424] border-gray-800 hover:bg-[#2c2c2c] hover:border-gray-700'
                  : 'bg-white border-gray-200 hover:bg-[#f5f5f5] hover:border-gray-300'
              }`}
            >
              {/* Logo & Text Content */}
              <div>
                <img
                src={getImageUrl(`${company.id}.png`)}
                alt={`${company.name} Logo`}
                className="h-10 w-auto mb-5 object-contain"
                />
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-[#262626]'
                }`}>
                  {company.name}
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {company.desc}
                </p>
              </div>

              {/* Start Button */}
              <button
                onClick={() => handleStartContest(company.id)}
                disabled={loadingCompany !== null}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  loadingCompany === company.id
                    ? 'bg-blue-400 text-white cursor-wait'
                    : loadingCompany !== null
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md'
                }`}
              >
                {loadingCompany === company.id ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Enter Contest'
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import CompanyContest from "./pages/CompanyContest";
import CustomContest from "./pages/CustomContest";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import './App.css';
import './index.css';
import { useTheme } from "./context/ThemeContext";
function App() {
  const { theme } = useTheme();
  useEffect(() => {
    const handleMessage = (event) => {
      //message from content.js
      if (event.data && event.data.type === 'LCCC_INIT_DATA') {

        //storign it is sessionStorage for later usage(status poller)
        sessionStorage.setItem('lccc_csrf_token', event.data.csrfToken);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);
  return (
    <>
      <HashRouter>
        {/* <div className="min-h-screen bg-[#1a1a1a] text-gray-200 font-sans"> */}
        <div className={`min-h-screen ${theme} ${theme === 'dark' ? 'bg-[#1a1a1a] text-gray-200' : 'bg-[#f8f8f8] text-gray-800'} font-sans`}>
          <Routes>
            {/* Default view when the iframe opens */}
            <Route path="/" element={<Home />} />
            {/* Sub-routing configuration matching your product design */}
            <Route path="/custom-contest" element={<CustomContest />} />
            <Route path="/company-contest" element={<CompanyContest />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </HashRouter>
    </>
  )
}

export default App;
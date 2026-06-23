import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function History() {
    const {theme, username} = useTheme();
    const[historyData, setHistoryData] = useState([]);
    const[isLoading, setIsLoading] = useState(true);
    const[error, setError] = useState(null);
    useEffect(() => {
            const fetchHistory = async () => {
                try{
                    const response = await fetch(`http://localhost:8080/api/contests/history/${username}`);
                    if(!response.ok){
                        throw new Error(`Request failed with status ${response.status}`);
                    }
                    const data = await response.json();

                    setHistoryData(data);
                }
                catch(err){
                    setError(err.message);
                }
                finally{
                    setIsLoading(false);
                }
            };
            fetchHistory();
       },[]);
  return(
      <>
        {console.log(historyData)}
      </>
      );
}
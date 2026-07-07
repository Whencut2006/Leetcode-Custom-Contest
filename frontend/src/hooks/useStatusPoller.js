import { useState, useEffect, useRef } from 'react';

export const useStatusPoller = (username, contestStartTime, contestProblems, timeLeft) => {
    // set to prevent duplicates
    const [solvedSlugs, setSolvedSlugs] = useState(new Set());

    const isPolling = useRef(false);

    const pollLeetCode = async () => {
        if (!username || !contestStartTime || isPolling.current) return;

        isPolling.current = true;

        try {
            const csrfToken = sessionStorage.getItem('lccc_csrf_token');

            if (!csrfToken) {
                return;
            }

            const query = `
                query recentAcSubmissions($username: String!, $limit: Int!) {
                    recentAcSubmissionList(username: $username, limit: $limit) {
                        titleSlug
                        timestamp
                    }
                }
            `;

            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: "POLL_LEETCODE",
                    csrfToken: csrfToken,
                    query: query,
                    variables: {
                        username: username,
                        limit: 15
                    }
                }, resolve);
            });

            if (!response || !response.success) {
                throw new Error(response?.error || "Background script failed to respond.");
            }

            const data = response.data;
            const submissions = data?.data?.recentAcSubmissionList || [];

            const newlySolved = submissions.filter(sub => {
                const isValidTime = (parseInt(sub.timestamp) * 1000) > contestStartTime;
                const isContestProblem = contestProblems.some(p => p.titleSlug === sub.titleSlug);
                return isValidTime && isContestProblem;
            });

            const updatedSet = new Set(solvedSlugs);
            newlySolved.forEach(sub => updatedSet.add(sub.titleSlug));

            if (newlySolved.length > 0) {
                setSolvedSlugs(updatedSet);
            }

            return Array.from(updatedSet);

        } catch (error) {
            console.error("Failed to poll LeetCode status:", error);
        } finally {
            isPolling.current = false;
        }
    };

    useEffect(() => {
        if (!username) return;

        const POLLING_INTERVAL = 6 * 60 * 1000;
        const intervalId = setInterval(pollLeetCode, POLLING_INTERVAL);

        return () => clearInterval(intervalId);
    }, [username, contestStartTime]);

    // final trigger - last 30 seconds
    useEffect(() => {
        if (timeLeft === 30) {
            pollLeetCode();
        }
    }, [timeLeft]);

    // array of solved slugs
    return { 
        solvedProblemSlugs: Array.from(solvedSlugs), 
        forcePoll: pollLeetCode 
    };
};

//Auth pre-fetcher (runs immediately in the bg on page load);
async function fetchLeetCodeAuth() {
    try {
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || '';

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrftoken': csrfToken
            },
            body: JSON.stringify({
                query: `
                    query globalData {
                        userStatus {
                            isSignedIn
                            username
                        }
                    }
                `
            })
        });

        const data = await response.json();
        return {
            isSignedIn: data.data.userStatus.isSignedIn,
            username: data.data.userStatus.username,
            csrfToken: csrfToken
        };
    } catch (error) {
        return { isSignedIn: false, username: null, csrfToken: null };
    }
}

const authPromise = fetchLeetCodeAuth();


function getThemeFromLeetcode() {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'dark' : 'light';
}


const _origPushState = history.pushState.bind(history);
history.pushState = function (...args) {
    _origPushState(...args);
    onRouteChange();
};
const _origReplaceState = history.replaceState.bind(history);
history.replaceState = function (...args) {
    _origReplaceState(...args);
    onRouteChange();
};
window.addEventListener("popstate", onRouteChange);

document.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");
    if (clickedLink && !clickedLink.hasAttribute("data-custom-contest")) {
        const lcccIframe = document.getElementById("lccc-iframe");
        if (lcccIframe && lcccIframe.style.display === "block") {
            lcccIframe.style.display = "none";
            document.body.style.overflow = "auto";
            const customTabLink = document.querySelector("a[data-custom-contest]");
            if (customTabLink) {
                const customTabLi = customTabLink.closest("li");
                customTabLi.classList.remove("nav-li-after", "border-text-primary", "dark:border-text-primary");
            }
        }
    }
});

function onRouteChange() {
    setTimeout(createCustomContestTab, 300);
    const lcccIframe = document.getElementById("lccc-iframe");
    if (lcccIframe && !window.location.search.includes('tab=custom-contest')) {
        lcccIframe.style.display = "none";
        document.body.style.overflow = "auto";
        const customTabLink = document.querySelector("a[data-custom-contest]");
        if (customTabLink) {
            const customTabLi = customTabLink.closest("li");
            customTabLi.classList.remove("nav-li-after", "border-text-primary", "dark:border-text-primary");
        }
    }
}


// navbar mutation obs
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            const hasContest = node.querySelector?.('a') !== null || node.tagName === 'A';
            if (hasContest) {
                createCustomContestTab();
                return;
            }
        }
    }
});
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(createCustomContestTab, 1000);


// tab injection and click logic
function createCustomContestTab() {
    const contestLink = [...document.querySelectorAll("a")]
        .find((a) => a.textContent.trim().toLowerCase() === "contest");

    if (!contestLink) return;

    const navbar = contestLink.closest("ul");
    const contestListElement = contestLink.closest("li");
    const nextItem = contestListElement?.nextElementSibling;

    const existingTab = navbar.querySelector("a[data-custom-contest]");
    if (existingTab) return;

    const customContestListElement = document.createElement("li");
    customContestListElement.className = "relative flex h-full items-center text-sm";

    const customContestLink = document.createElement("a");
    customContestLink.className = "relative whitespace-nowrap hover:text-text-primary dark:hover:text-text-primary flex items-center text-base leading-[22px] cursor-pointer text-text-secondary dark:text-text-secondary";
    customContestLink.textContent = "Custom Contest";
    customContestLink.href = "?tab=custom-contest";
    customContestLink.setAttribute("data-custom-contest", "true");

    customContestListElement.appendChild(customContestLink);

    // click handler
    customContestLink.addEventListener("click", async (event) => {
        event.preventDefault();
        document.title = "Leetcode - Custom Contest"

        // 1. Await the Pre-fetched promise
        const userStatus = await authPromise;

        if (!userStatus || !userStatus.isSignedIn || !userStatus.username) {
            window.location.href = "https://leetcode.com/accounts/login/";
            return;
        }

        const username = userStatus.username;
        const csrfToken = userStatus.csrfToken;

        // 2. Tab UI logic
        history.pushState(null, '', '?tab=custom-contest');
        const currentlyActiveTabs = document.querySelectorAll("li.nav-li-after");
        currentlyActiveTabs.forEach(tab => {
            tab.classList.remove("nav-li-after", "border-text-primary", "dark:border-text-primary");
        });
        customContestListElement.classList.add("nav-li-after", "border-text-primary", "dark:border-text-primary");

        const theme = getThemeFromLeetcode();
        let lcccIframe = document.getElementById("lccc-iframe");

        // 3. THE BROADCASTER: Function to send the token securely
        const transmitSecureData = function () {
            this.contentWindow.postMessage(
                {
                    type: 'LCCC_INIT_DATA',
                    csrfToken: csrfToken
                },
                '*'
            );
        };

        // 4. Mount Logic
        if (lcccIframe) {
            // case - 1 : iframe already exists
            lcccIframe.style.display = "block";
            document.body.style.overflow = "hidden";

            // attach broadcaster and update src
            lcccIframe.onload = transmitSecureData;
            lcccIframe.src = chrome.runtime.getURL(`ui/index.html?theme=${theme}&user=${username}`);
            return;
        }

        // case - 2 : creating iframe for the first time
        lcccIframe = document.createElement("iframe");
        lcccIframe.id = "lccc-iframe";

        // Attach broadcaster and set src
        lcccIframe.onload = transmitSecureData;
        lcccIframe.src = chrome.runtime.getURL(`ui/index.html?theme=${theme}&user=${username}`);

        lcccIframe.style.cssText = `
            position: fixed; 
            top: 50px;       
            left: 0;
            width: 100vw;
            height: calc(100vh - 50px);
            border: none;
            z-index: 6;   
            background-color: var(--bg-layer-1, #1a1a1a); 
            display: block;
        `;

        document.body.appendChild(lcccIframe);
        document.body.style.overflow = "hidden";
    });

    navbar.insertBefore(customContestListElement, nextItem);

    if (window.location.search.includes('tab=custom-contest')) {
        setTimeout(() => customContestLink.click(), 100);
    }
}
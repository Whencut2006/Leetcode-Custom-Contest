chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "POLL_LEETCODE") {

        fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': request.csrfToken,
            },
            body: JSON.stringify({
                query: request.query,
                variables: request.variables
            })
        })
        .then(response => response.json())
        .then(data => {
            sendResponse({ success: true, data: data });
        })
        .catch(error => {
            sendResponse({ success: false, error: error.toString() });
        });
        return true; 
    }
});
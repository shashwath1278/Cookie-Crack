chrome.tabs.onRemoved.addListener(() => {
    chrome.cookies.getAll({}, (cookies) => {
        cookies.forEach((cookie) => {
            chrome.cookies.remove({
                url: `https://${cookie.domain}${cookie.path}`,
                name: cookie.name,
            });
        });
    });
});

chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
        "id": 1,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
            "resourceTypes": ["script"],
            "urlFilter": "*thirdparty*"
        }
    }]
});
chrome.cookies.onChanged.addListener((changeInfo) => {
    console.log("Cookie changed:", changeInfo);
    alert(`Cookie ${changeInfo.cookie.name} was ${changeInfo.removed ? "removed" : "added/updated"}`);
});

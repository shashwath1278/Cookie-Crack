document.addEventListener("DOMContentLoaded", async function () {
    const essentialCookiesList = document.getElementById("essentialCookies");
    const trackingCookiesList = document.getElementById("trackingCookies");
    const clearTrackingButton = document.getElementById("clearTrackingCookies");
    const darkModeToggle = document.getElementById("darkModeToggle");

    const trackerDomains = [
        "google-analytics.com", "doubleclick.net", "adservice.google.com", "googlesyndication.com",
        "googletagmanager.com", "googletagservices.com", "googleadservices.com", "pagead2.googlesyndication.com",
        "facebook.com", "facebook.net", "connect.facebook.net", "graph.facebook.com", "ads.facebook.com",
        "pixel.facebook.com", "bing.com", "bat.bing.com", "clarity.ms", "ads.microsoft.com",
        "ads.yahoo.com", "analytics.yahoo.com", "verizonmedia.com", "adtech.yahooinc.com",
        "twitter.com", "analytics.twitter.com", "ads-api.twitter.com", "ads.twitter.com",
        "ads.tiktok.com", "analytics.tiktok.com", "business.tiktok.com",
        "linkedin.com", "px.ads.linkedin.com", "analytics.linkedin.com",
        "amazon-adsystem.com", "advertising.amazon.com", "s.amazon-adsystem.com",
        "criteo.com", "adsrvr.org", "quantserve.com", "adroll.com", "outbrain.com", "taboola.com", 
        "adnxs.com", "rubiconproject.com", "hotjar.com", "newrelic.com", "mixpanel.com", "segment.io", "scorecardresearch.com"
    ];

    const protectedDomains = [
        "accounts.google.com", "mail.google.com", "youtube.com", "drive.google.com",
        "docs.google.com", "calendar.google.com", "photos.google.com", "meet.google.com",
        "login.live.com", "outlook.com", "office.com", "onedrive.live.com",
        "facebook.com", "instagram.com", "business.facebook.com", "twitter.com", "x.com",
        "linkedin.com", "tiktok.com", "amazon.com", "signin.aws.amazon.com",
        "github.com", "gitlab.com", "stackoverflow.com", "paypal.com", "discord.com"
    ];

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
        essentialCookiesList.innerHTML = "<li>Unable to fetch cookies.</li>";
        return;
    }

    let domain = new URL(tab.url).hostname;

    function loadCookies() {
        chrome.cookies.getAll({ domain }, (cookies) => {
            essentialCookiesList.innerHTML = "";
            trackingCookiesList.innerHTML = "";

            if (cookies.length === 0) {
                essentialCookiesList.innerHTML = "<li>No cookies found.</li>";
                return;
            }

            let essentialCookies = [];
            let trackingCookies = [];

            cookies.forEach((cookie) => {
                if (
                    trackerDomains.some(tracker => cookie.domain.includes(tracker)) &&
                    !protectedDomains.some(protected => cookie.domain.includes(protected))
                ) {
                    trackingCookies.push(cookie);
                } else {
                    essentialCookies.push(cookie);
                }
            });

            essentialCookies.forEach((cookie) => {
                let listItem = document.createElement("li");
                listItem.textContent = `${cookie.name}: ${cookie.value.substring(0, 20)}...`;
                essentialCookiesList.appendChild(listItem);
            });

            trackingCookies.forEach((cookie) => {
                let listItem = document.createElement("li");
                listItem.textContent = `${cookie.name}: ${cookie.value.substring(0, 20)}...`;
                trackingCookiesList.appendChild(listItem);
            });

            if (trackingCookies.length === 0) {
                trackingCookiesList.innerHTML = "<li>No tracking cookies detected.</li>";
            }
        });
    }

    loadCookies();

    clearTrackingButton.addEventListener("click", () => {
        chrome.cookies.getAll({ domain }, (cookies) => {
            let trackingCookies = cookies.filter(cookie =>
                trackerDomains.some(tracker => cookie.domain.includes(tracker)) &&
                !protectedDomains.some(protected => cookie.domain.includes(protected))
            );

            if (trackingCookies.length === 0) {
                alert("No tracking cookies found.");
                return;
            }

            trackingCookies.forEach((cookie) => {
                chrome.cookies.remove({
                    url: `https://${cookie.domain}${cookie.path}`,
                    name: cookie.name,
                });
            });

            alert("Tracking cookies deleted (Google login cookies preserved)!");
            setTimeout(loadCookies, 1000); 
        });
    });
    chrome.storage.sync.get("darkMode", function (data) {
        if (data.darkMode) {
            document.body.classList.add("dark-mode");
            darkModeToggle.checked = true;
        }
    });

    darkModeToggle.addEventListener("change", function () {
        document.body.classList.toggle("dark-mode");
        chrome.storage.sync.set({ darkMode: this.checked });
    });
});

(function () {
    "use strict";

    const API_BASE = "";

    const domainInput = document.getElementById("domain-input");
    const scanBtn = document.getElementById("scan-btn");
    const errorEl = document.getElementById("error");
    const loadingEl = document.getElementById("loading");
    const resultsEl = document.getElementById("results");
    const scoreEl = document.getElementById("score");
    const scoreBandEl = document.getElementById("score-band");
    const summaryEl = document.getElementById("summary");
    const categoryGrid = document.getElementById("category-grid");
    const findingsEl = document.getElementById("findings");
    const emailInput = document.getElementById("email-input");
    const unlockBtn = document.getElementById("unlock-btn");
    const unlockStatus = document.getElementById("unlock-status");
    const fullReport = document.getElementById("full-report");
    const reportJson = document.getElementById("report-json");

    let currentScanId = null;

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
    }

    function clearError() {
        errorEl.textContent = "";
        errorEl.classList.add("hidden");
    }

    function setLoading(isLoading) {
        loadingEl.classList.toggle("hidden", !isLoading);
        scanBtn.disabled = isLoading;
        scanBtn.textContent = isLoading ? "Scanning..." : "Scan";
    }

    function escapeHtml(value) {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(value == null ? "" : String(value)));
        return div.innerHTML;
    }

    function scoreClass(score) {
        if (score >= 75) return "good";
        if (score >= 50) return "warn";
        return "bad";
    }

    function renderCategories(scores) {
        categoryGrid.innerHTML = "";
        Object.entries(scores || {}).forEach(([name, value]) => {
            const item = document.createElement("div");
            item.className = "category-card";
            item.innerHTML = `
                <div class="small-label">${escapeHtml(name.replaceAll("_", " "))}</div>
                <div class="category-score">${escapeHtml(value)}</div>
            `;
            categoryGrid.appendChild(item);
        });
    }

    function renderFindings(findings) {
        findingsEl.innerHTML = "";
        (findings || []).forEach((finding) => {
            const item = document.createElement("article");
            item.className = "finding " + escapeHtml(finding.severity || "info");
            item.innerHTML = `
                <div class="finding-top">
                    <span class="severity">${escapeHtml(finding.severity || "info")}</span>
                    <h3>${escapeHtml(finding.title)}</h3>
                </div>
                <p>${escapeHtml(finding.detail)}</p>
                <p class="recommendation"><strong>Fix:</strong> ${escapeHtml(finding.recommendation)}</p>
            `;
            findingsEl.appendChild(item);
        });
    }

    function renderScan(data) {
        currentScanId = data.scan_id;
        resultsEl.classList.remove("hidden");
        fullReport.classList.add("hidden");
        unlockStatus.textContent = "";
        const score = data.score || 0;
        scoreEl.textContent = score;
        scoreEl.className = "score " + scoreClass(score);
        scoreBandEl.textContent = data.score_band || "Unknown";
        summaryEl.textContent = data.summary_preview || "No summary generated.";
        renderCategories(data.category_scores || {});
        renderFindings(data.top_findings || []);
    }

    async function scanDomain() {
        clearError();
        const domain = domainInput.value.trim();
        if (!domain) {
            showError("Enter a domain, for example example.com");
            return;
        }
        resultsEl.classList.add("hidden");
        setLoading(true);
        try {
            const response = await fetch(API_BASE + "/api/scans", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ domain })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Scan failed.");
            if (data.status === "failed") throw new Error(data.error_message || "Scan failed.");
            renderScan(data);
        } catch (err) {
            showError(err.message || "Scan failed.");
        } finally {
            setLoading(false);
        }
    }

    async function unlockReport() {
        clearError();
        if (!currentScanId) {
            showError("Run a scan first.");
            return;
        }
        const email = emailInput.value.trim();
        if (!email || !email.includes("@")) {
            unlockStatus.textContent = "Enter a valid email address.";
            return;
        }
        unlockBtn.disabled = true;
        unlockStatus.textContent = "Unlocking...";
        try {
            const leadResponse = await fetch(API_BASE + "/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ scan_id: currentScanId, email, role: "MVP user", marketing_consent: true })
            });
            const leadData = await leadResponse.json();
            if (!leadResponse.ok) throw new Error(leadData.detail || "Unlock failed.");

            const reportResponse = await fetch(API_BASE + "/api/reports/" + encodeURIComponent(currentScanId));
            const reportData = await reportResponse.json();
            if (!reportResponse.ok) throw new Error(reportData.detail || "Report fetch failed.");
            unlockStatus.textContent = "Unlocked.";
            fullReport.classList.remove("hidden");
            reportJson.textContent = JSON.stringify(reportData, null, 2);
        } catch (err) {
            unlockStatus.textContent = err.message || "Unlock failed.";
        } finally {
            unlockBtn.disabled = false;
        }
    }

    scanBtn.addEventListener("click", scanDomain);
    unlockBtn.addEventListener("click", unlockReport);
    domainInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") scanDomain();
    });
    domainInput.addEventListener("input", clearError);
    domainInput.focus();
})();

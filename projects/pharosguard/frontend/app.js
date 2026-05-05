/**
 * PharosGuard — Frontend App Logic
 * Wallet risk analysis for the Pharos ecosystem.
 */

(function () {
    "use strict";

    // --- Configuration ---
    // The API base URL. In production, this would point to the deployed backend.
    // For development, we default to localhost:8000.
    const API_BASE = (function () {
        // Allow override via data attribute or environment
        const meta = document.querySelector('meta[name="api-base"]');
        if (meta) return meta.getAttribute("content");
        // Auto-detect: if not localhost, use Tailscale funnel URL
        if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
            return "https://hermes.tail07438b.ts.net";
        }
        // Default for local development
        return "http://localhost:8000";
    })();

    // --- DOM References ---
    const walletInput = document.getElementById("wallet-input");
    const analyzeBtn = document.getElementById("analyze-btn");
    const validationError = document.getElementById("validation-error");
    const loading = document.getElementById("loading");
    const resultsSection = document.getElementById("results");
    const riskBadge = document.getElementById("risk-badge");
    const riskScoreEl = document.getElementById("risk-score");
    const riskLevelEl = document.getElementById("risk-level");
    const summaryText = document.getElementById("summary-text");
    const metricTxCount = document.getElementById("metric-tx-count");
    const metricContracts = document.getElementById("metric-contracts");
    const metricDiversity = document.getElementById("metric-diversity");
    const metricAge = document.getElementById("metric-age");
    const flagsList = document.getElementById("flags-list");
    const noFlags = document.getElementById("no-flags");
    const analyzedAddress = document.getElementById("analyzed-address");
    const quickBtns = document.querySelectorAll(".quick-btn");

    // --- EVM Address Validation ---
    const EVM_REGEX = /^0x[a-fA-F0-9]{40}$/;

    function isValidEVMAddress(addr) {
        return EVM_REGEX.test(addr.trim());
    }

    // --- UI Helpers ---
    function showValidationError(msg) {
        validationError.textContent = msg;
        validationError.classList.remove("hidden");
        walletInput.classList.add("error");
    }

    function hideValidationError() {
        validationError.classList.add("hidden");
        walletInput.classList.remove("error");
    }

    function showLoading() {
        loading.classList.remove("hidden");
        resultsSection.classList.add("hidden");
        analyzeBtn.disabled = true;
    }

    function hideLoading() {
        loading.classList.add("hidden");
        analyzeBtn.disabled = false;
    }

    function showResults(data) {
        resultsSection.classList.remove("hidden");
        resultsSection.style.animation = "none";
        // Force reflow to restart animation
        void resultsSection.offsetHeight;
        resultsSection.style.animation = "fadeInUp 0.4s ease-out";
    }

    function clearResults() {
        resultsSection.classList.add("hidden");
        flagsList.innerHTML = "";
    }

    // --- Risk Badge Rendering ---
    function renderRiskBadge(score, level) {
        // Remove existing classes
        riskBadge.classList.remove("low", "medium", "high");

        const levelClass = level.toLowerCase();
        riskBadge.classList.add(levelClass);

        riskScoreEl.textContent = score;
        riskLevelEl.textContent = level.toUpperCase();
    }

    // --- Metrics Rendering ---
    function renderMetrics(metrics) {
        metricTxCount.textContent = metrics.transaction_count ?? 0;
        metricContracts.textContent = metrics.unique_recipients ?? 0;
        metricDiversity.textContent = metrics.interaction_diversity ?? 0;
        metricAge.textContent = metrics.wallet_age_days ?? 0;
        // Additional metrics
        var balanceEl = document.getElementById("metric-balance");
        if (balanceEl) balanceEl.textContent = metrics.balance_pharos || "0";
        var outgoingEl = document.getElementById("metric-outgoing");
        if (outgoingEl) outgoingEl.textContent = metrics.outgoing_transactions ?? 0;
    }

    // --- Flags Rendering ---
    function renderFlags(flags) {
        flagsList.innerHTML = "";

        if (!flags || flags.length === 0) {
            noFlags.classList.remove("hidden");
            return;
        }

        noFlags.classList.add("hidden");

        const typeIcons = {
            critical: "\u26A0\uFE0F",  // ⚠️
            warning: "\u26A0",          // ⚠
            info: "\u2139\uFE0F",       // ℹ️
            positive: "\u2705",         // ✅
        };

        flags.forEach(function (flag, index) {
            const icon = typeIcons[flag.type] || "\u2139\uFE0F";

            const item = document.createElement("div");
            item.className = "flag-item " + flag.type;
            item.style.animationDelay = (index * 0.08) + "s";

            item.innerHTML =
                '<span class="flag-icon">' + icon + '</span>' +
                '<div class="flag-content">' +
                    '<div class="flag-label">' + escapeHtml(flag.label) + '</div>' +
                    '<div class="flag-desc">' + escapeHtml(flag.description) + '</div>' +
                '</div>';

            flagsList.appendChild(item);
        });
    }

    // --- Simple HTML escaping ---
    function escapeHtml(str) {
        if (!str) return "";
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Address Display ---
    function renderAddress(address) {
        analyzedAddress.textContent = address;
    }

    // --- Main Analysis Function ---
    async function analyzeWallet(address) {
        hideValidationError();
        clearResults();
        showLoading();

        try {
            const url = API_BASE + "/analyze/" + encodeURIComponent(address.trim());

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                let errMsg = "Server returned " + response.status;
                try {
                    const errData = await response.json();
                    if (errData.detail) errMsg = errData.detail;
                } catch (e) {}
                throw new Error(errMsg);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || "Unknown error from server");
            }

            // Render results
            renderRiskBadge(data.risk_score, data.risk_level);
            renderMetrics(data.metrics);
            renderFlags(data.flags);
            renderAddress(data.wallet_address);

            // Summary
            summaryText.textContent = data.summary || "No summary available.";

            showResults(data);

        } catch (err) {
            hideLoading();
            showValidationError("Analysis failed: " + err.message);
            console.error("PharosGuard analysis error:", err);
        } finally {
            hideLoading();
        }
    }

    // --- Event Handlers ---
    function handleAnalyze() {
        const rawAddress = walletInput.value;
        const address = rawAddress.trim();

        if (!address) {
            showValidationError("Please enter a wallet address.");
            return;
        }

        if (!isValidEVMAddress(address)) {
            showValidationError(
                "Invalid address format. EVM addresses must be 42 characters starting with '0x' and contain only hex characters (0-9, a-f, A-F)."
            );
            return;
        }

        hideValidationError();
        analyzeWallet(address);
    }

    // --- Quick Button Handlers ---
    quickBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const address = btn.getAttribute("data-address");
            walletInput.value = address;
            hideValidationError();
            // Auto-trigger analysis
            handleAnalyze();
        });
    });

    // --- Enter key support ---
    walletInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAnalyze();
        }
    });

    // --- Clear error on input ---
    walletInput.addEventListener("input", function () {
        hideValidationError();
    });

    // --- Main button click ---
    analyzeBtn.addEventListener("click", handleAnalyze);

    // --- Initial focus ---
    walletInput.focus();

    console.log("PharosGuard v1.0.0 loaded");
    console.log("API endpoint:", API_BASE + "/analyze/{wallet}");

})();

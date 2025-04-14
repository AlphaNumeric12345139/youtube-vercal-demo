ocument.getElementById('analyzeButton').addEventListener('click', async function() {
    const urlInput = document.getElementById('urlInput').value.trim();
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const overviewTab = document.getElementById('overview');
    const detailsTab = document.getElementById('details');

    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;
    if (!urlInput || !urlPattern.test(urlInput)) {
        alert("❌ Please enter a valid URL (e.g., https://example.com)");
        return;
    }

    const url = urlInput.startsWith('http') ? urlInput : 'https://' + urlInput;
    resultsDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    const apiKey = '884dc6472bacff305e3cbfd463d9d3024ddcd713f9a8658c9752cb97b8a4f008';

    try {
        const hostname = new URL(url).hostname;
        const ipResponse = await fetch(`http://ip-api.com/json/${hostname}`);
        const ipData = await ipResponse.json();

        const ipAddress = ipData.query;
        const location = `${ipData.city}, ${ipData.country}`;

        const submitResponse = await fetch("https://www.virustotal.com/api/v3/urls", {
            method: "POST",
            headers: {
                "x-apikey": apiKey,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ url: url })
        });

        const submitData = await submitResponse.json();
        const analysisId = submitData.data.id;

        setTimeout(async () => {
            const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
                headers: { "x-apikey": apiKey }
            });

            const analysisData = await analysisResponse.json();
            const maliciousCount = analysisData.data.attributes.stats.malicious;
            const scanResults = analysisData.data.attributes.results;

            overviewTab.innerHTML = `<h2>Analysis Results for ${url}</h2>
                <p><strong>IP Address:</strong> ${ipAddress}</p>
                <p><strong>Server Location:</strong> ${location}</p>
                <p><strong>Status:</strong> <span class="${maliciousCount > 0 ? 'unsafe' : 'safe'}">
                ${maliciousCount > 0 ? "⚠️ UNSAFE" : "✅ SAFE"}</span></p>`;

            // Populate Scan Details
            detailsTab.innerHTML = `<h2>Scan Details</h2><ul>`;
            for (const [scanner, result] of Object.entries(scanResults)) {
                detailsTab.innerHTML += `<li><strong>${scanner}:</strong> ${result.category}</li>`;
            }
            detailsTab.innerHTML += `</ul>`;

            resultsDiv.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
        }, 5000);
    } catch (error) {
        resultsDiv.innerHTML = `<p>❌ Error fetching results.</p>`;
        resultsDiv.classList.remove('hidden');
        loadingDiv.classList.add('hidden');
    }
});

// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// Tab Switching Logic
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');
    });
});

// Clear Button Functionality
document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('urlInput').value = "";
    document.getElementById('results').classList.add('hidden');
});

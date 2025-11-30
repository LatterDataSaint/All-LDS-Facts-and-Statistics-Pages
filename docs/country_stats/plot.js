// RAW CSV URL
const CSV_URL = "https://raw.githubusercontent.com/LatterDataSaint/All-LDS-Facts-and-Statistics-Pages/main/lds_fs_countries_20120213-to-20250803_v2.csv";

// Load CSV and return parsed objects
async function loadCSV() {
    const response = await fetch(CSV_URL);
    const text = await response.text();

    const lines = text.split("\n").map(line => line.split(","));

    const header = lines[0];
    const rows = lines.slice(1);

    const countryIndex = header.indexOf("country");
    const yearIndex = header.indexOf("year");
    const membershipIndex = header.indexOf("total_church_membership");
    const congregationsIndex = header.indexOf("congregations");

    return rows
        .filter(r => r.length > 4 && r[countryIndex]) // filter blank rows
        .map(r => ({
            country: r[countryIndex],
            year: parseInt(r[yearIndex]),
            membership: parseInt(r[membershipIndex]),
            congregations: parseInt(r[congregationsIndex])
        }));
}

// Populate dropdown
function populateCountries(data) {
    const select = document.getElementById("countrySelect");

    const countries = [...new Set(data.map(d => d.country))].sort();

    countries.forEach(country => {
        const opt = document.createElement("option");
        opt.value = country;
        opt.textContent = country;
        select.appendChild(opt);
    });
}

// Draw chart
function drawChart(country, data) {
    const filtered = data.filter(d => d.country === country);

    const trace1 = {
        x: filtered.map(d => d.year),
        y: filtered.map(d => d.membership),
        mode: "lines+markers",
        name: "Membership"
    };

    const trace2 = {
        x: filtered.map(d => d.year),
        y: filtered.map(d => d.congregations),
        mode: "lines+markers",
        name: "Congregations"
    };

    Plotly.newPlot("chart", [trace1, trace2], {
        title: `${country}: Membership & Congregations`,
        xaxis: { title: "Year" },
        yaxis: { title: "Count" }
    });
}

// Initialize page
(async function () {
    const data = await loadCSV();
    populateCountries(data);

    const select = document.getElementById("countrySelect");

    // Draw initial chart (first country alphabetically)
    drawChart(select.value, data);

    // Update chart when a new country is selected
    select.addEventListener("change", () => {
        drawChart(select.value, data);
    });
})();

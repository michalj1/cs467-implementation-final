let shots = [];
let stats = [];
let maxStats = {}; // Object to hold maximum values for each statistic

async function GetShots() {
    return await d3.csv("static/data/shots.csv");
}

async function GetStats() {
    let data = await d3.csv("static/data/NBA_Advanced_Stats_2002-2022.csv");

    // Calculate maxima for relevant stats
    maxStats = {
        'Age': d3.max(data, d => parseFloat(d['Age'])),
        'TS%': d3.max(data, d => parseFloat(d['TS%'])),
        'AST%': d3.max(data, d => parseFloat(d['AST%'])),
        'STL%': d3.max(data, d => parseFloat(d['STL%'])),
        'BLK%': d3.max(data, d => parseFloat(d['BLK%'])),
        'TOV%': d3.max(data, d => parseFloat(d['TOV%'])),
        'USG%': d3.max(data, d => parseFloat(d['USG%'])),
        'WS': d3.max(data, d => parseFloat(d['WS'])),
        'BPM': d3.max(data, d => parseFloat(d['BPM']))
    };

    return data;
}


async function PopulateDropdowns() {
    shots = await GetShots();
    stats = await GetStats();

    const playerSelect = document.getElementById('player_select');
    const seasonSelect = document.getElementById('season_select');
    const teamSelect = document.getElementById('team_select');

    // Get unique players, seasons, and teams from both datasets
    let players = Array.from(new Set([...shots.map(item => item['Player Name']), ...stats.map(item => item['year-name'].split('-')[1])])).sort();
    let seasons = Array.from(new Set(shots.map(item => item['Game Date'].substring(0, 4)))).sort().reverse(); // Assuming 'Game Date' is in YYYYMMDD format
    let teams = Array.from(new Set(shots.map(item => item['Team Name']))).sort();

    // Populate player dropdown
    playerSelect.innerHTML = players.map(player => `<option value="${player}">${player}</option>`).join('');
    playerSelect.addEventListener('change', () => {
        DrawCourt();
        DrawRadarChart();
    });

    // Populate season dropdown
    seasonSelect.innerHTML = `<option value="All" selected>All Seasons</option>` + seasons.map(season => `<option value="${season}">${season}</option>`).join('');
    seasonSelect.addEventListener('change', () => {
        DrawCourt();
        DrawRadarChart(); // Also redraw the radar chart
    });

    // Populate team dropdown
    teamSelect.innerHTML = `<option value="All" selected>All Teams</option>` + teams.map(team => `<option value="${team}">${team}</option>`).join('');
    teamSelect.addEventListener('change', () => {
        DrawCourt();
        DrawRadarChart(); // Also redraw the radar chart
    });

}

function DrawCourt() {
    const shotContainer = document.getElementById(`shot_container`);
    const playerSelect = document.getElementById('player_select');
    const seasonSelect = document.getElementById('season_select');
    const teamSelect = document.getElementById('team_select');

    const player = playerSelect.value;
    const selectedSeason = seasonSelect.value;
    const selectedTeam = teamSelect.value;

    // Filter shots based on selected player, season, and team
    const filteredShots = shots.filter(item => {
        if (player !== 'All' && item['Player Name'] !== player) return false;
        if (selectedSeason !== 'All' && !item['Game Date'].startsWith(selectedSeason)) return false;
        if (selectedTeam !== 'All' && item['Team Name'] !== selectedTeam) return false;
        return true;
    });

    // Make scatterplot of filtered shots on the court

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 500,
        height = 940 / 2;

    // Clear any existing content in the container
    d3.select("#shot_container").selectAll("*").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#shot_container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add court image
    shotContainer.getElementsByTagName('svg')[0].getElementsByTagName('g')[0].innerHTML = `<image href="static/data/nba_court.jpg" height="${height}" width="${width}"/>`

    // Add X axis
    var x = d3.scaleLinear()
        .domain([-250, 250])
        .range([ 0, width ]);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-52, 418])
        .range([ height, 0]);

    // Add dots for filtered shots
    svg.append('g')
        .selectAll("dot")
        .data(filteredShots)
        .enter()
        .append("circle")
        .attr("cx", d => x(d['X Location']))
        .attr("cy", d => y(Math.min(d['Y Location'], 418)))
        .attr("r", 3)
        .attr("fill", d => {
            if (d['Shot Made Flag'] == 1) {
                return "blue";
            } else {
                return "red";
            }
        })
        .attr("fill-opacity", 0.3);
}

function DrawRadarChart() {
    const playerSelect = document.getElementById('player_select');
    const seasonSelect = document.getElementById('season_select');
    const selectedPlayer = playerSelect.value;

    // Filter stats based on selected player
    const playerStats = stats.find(item => item['year-name'].split('-')[1] === selectedPlayer && (seasonSelect.value === 'All' || item['year-name'].startsWith(seasonSelect.value)));
    if (!playerStats) {
        console.log("No stats available for selected player or season");
        return;
    }
    // Define tooltips for each statistic
    const tooltips = {
        'Age': "Player's age on February 1 of the season",
        'TS%': "True Shooting Percentage: A measure of shooting efficiency that takes into account 2-point field goals, 3-point field goals, and free throws.",
        'AST%': "Assist Percentage: An estimate of the percentage of teammate field goals a player assisted while they were on the floor.",
        'STL%': "Steal Percentage: An estimate of the percentage of opponent possessions that end with a steal by the player while they were on the floor.",
        'BLK%': "Block Percentage: An estimate of the percentage of opponent two-point field goal attempts blocked by the player while they were on the floor.",
        'TOV%': "Turnover Percentage: An estimate of turnovers committed per 100 plays.",
        'USG%': "Usage Percentage: An estimate of the percentage of team plays used by a player while they were on the floor.",
        'WS': "Win Shares: An estimate of the number of wins contributed by a player.",
        'BPM': "Box Plus/Minus: A box score estimate of the points per 100 possessions a player contributed above a league-average player, translated to an average team."
    };
    // Extract relevant stats for radar chart
    const radarStats = {
        'Age': parseFloat(playerStats['Age']),
        'TS%': parseFloat(playerStats['TS%']),
        'AST%': parseFloat(playerStats['AST%']),
        'STL%': parseFloat(playerStats['STL%']),
        'BLK%': parseFloat(playerStats['BLK%']),
        'TOV%': parseFloat(playerStats['TOV%']),
        'USG%': parseFloat(playerStats['USG%']),
        'WS': parseFloat(playerStats['WS']),
        'BPM': parseFloat(playerStats['BPM'])
    };
    const bpmRange = Math.max(Math.abs(d3.min(stats, d => parseFloat(d['BPM']))), Math.abs(d3.max(stats, d => parseFloat(d['BPM']))));
    const realisticMaxBLK = 10; 
    const realisticMaxSTL = 3; 
    // Adjust normalization for each stat
    Object.keys(maxStats).forEach(key => {
        let value = parseFloat(playerStats[key]);
        switch (key) {
            case 'STL%':
                radarStats[key] = Math.min(value / realisticMaxSTL * 100, 100);
            case 'BLK%':
                radarStats[key] = 100 - Math.min(value / realisticMaxBLK * 100, 100);
                break;
            case 'BPM':
                // Normalize BPM from -bpmRange to +bpmRange to a scale from 0 to 100
                radarStats[key] = (value + bpmRange) / (2 * bpmRange) * 100;
                break;
            case 'Age':
                // Inverse because lower Age is better
                radarStats[key] = 100 - (value / maxStats[key] * 100);
                break;
            case 'TOV%':
                // Inverse because lower TOV% is better
                radarStats[key] = 100 - (value / maxStats[key] * 100);
                break;
            default:
                // Normalization for other stats where higher is better
                radarStats[key] = (value / maxStats[key]) * 100;
                break;
        }
    });


    // Define radar chart parameters
    const radarChartOptions = {
        w: 300,
        h: 300,
        margin: { top: 50, right: 50, bottom: 50, left: 50 },
        maxValue: 100,
        levels: 5,
        roundStrokes: true,
        color: d3.scaleOrdinal().range(["#FF6347"])
    };

    // Remove existing radar chart if any
    d3.select("#radar_chart").select("svg").remove();

    // Create radar chart SVG
    const svg = d3.select("#radar_chart").append("svg")
        .attr("width", radarChartOptions.w + radarChartOptions.margin.left + radarChartOptions.margin.right)
        .attr("height", radarChartOptions.h + radarChartOptions.margin.top + radarChartOptions.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (radarChartOptions.w / 2 + radarChartOptions.margin.left) + "," + (radarChartOptions.h / 2 + radarChartOptions.margin.top) + ")");

    // Define radar chart axes
    const allAxis = Object.keys(radarStats);
    const total = allAxis.length;
    const radius = Math.min(radarChartOptions.w / 2, radarChartOptions.h / 2);

    // Draw radar chart axes
    const axisGrid = svg.append("g").attr("class", "axisWrapper");
    const axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");
    axis.append("line")
        .attr("x1", (d, i) => radius * Math.cos(Math.PI * 2 * i / total))
        .attr("y1", (d, i) => radius * Math.sin(Math.PI * 2 * i / total))
        .attr("x2", (d, i) => radius * Math.cos(Math.PI * 2 * (i + 1) / total))
        .attr("y2", (d, i) => radius * Math.sin(Math.PI * 2 * (i + 1) / total))
        .attr("class", "line")
        .style("stroke", "black")
        .style("stroke-width", "2px");
    
    // Define an additional offset to push the labels outwards
    const labelRadiusOffset = 20;  // Additional pixels to push the labels outward

    axis.append("text")
        .attr("class", "legend")
        .text(d => d)
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("transform", (d, i) => "translate(0, -10)")
        .attr("x", (d, i) => (radius + labelRadiusOffset) * Math.cos(Math.PI * 2 * i / total))  // Add labelRadiusOffset to the radius
        .attr("y", (d, i) => (radius + labelRadiusOffset) * Math.sin(Math.PI * 2 * i / total))  // Add labelRadiusOffset to the radius
        .append("title")  // Append title element for tooltip
        .text(d => tooltips[d]);  // Set tooltip text based on the tooltips object


    // Draw radar chart polygons
    const dataValues = [];
    axisGrid.selectAll(".nodes")
        .data([radarStats])
        .enter()
        .append("polygon")
        .attr("class", "radar-chart-serie0")
        .style("stroke-width", "2px")
        .style("stroke", radarChartOptions.color(0))
        .attr("points", d => {
            const str = [];
            for (let j = 0; j < total; j++) {
                const value = d[allAxis[j]] != undefined ? d[allAxis[j]] : 0;
                const x = radius * (1 - Math.max(value, 0) / radarChartOptions.maxValue) * Math.cos(Math.PI * 2 * j / total);
                const y = radius * (1 - Math.max(value, 0) / radarChartOptions.maxValue) * Math.sin(Math.PI * 2 * j / total);
                str.push(x + "," + y);
            }
            return str.join(" ");
        })
        .style("fill", radarChartOptions.color(0))
        .style("fill-opacity", 0.2)
        .on("mouseover", function(event, d) {
            // Position and show the tooltip
            d3.select("#tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .style("display", "block")
                .html(() => {
                    let html = "";
                    Object.entries(d).forEach(([key, value]) => {
                        html += `<strong>${key}</strong>: ${value.toFixed(2)} (${tooltips[key]})<br>`;
                    });
                    return html;
                });
        })
        .on("mouseout", function() {
            // Hide the tooltip
            d3.select("#tooltip").style("display", "none");
        });


    // Add tooltips for data points
    axisGrid.selectAll(".nodes")
        .data([radarStats])
        .enter()
        .selectAll("text")
        .data(d => Object.keys(d))
        .enter()
        .append("text")
        .attr("class", "radar-chart-serie0")
        .attr("x", (d, i) => radius * Math.cos(Math.PI * 2 * i / total))
        .attr("y", (d, i) => radius * Math.sin(Math.PI * 2 * i / total))
        .text(d => d + ": " + radarStats[d])
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("transform", (d, i) => {
            if (i === 0) return "translate(" + (radius / 3) * Math.cos(Math.PI * 2 * i / total) + "," + (radius / 3) * Math.sin(Math.PI * 2 * i / total) + ")";
            else return "translate(" + (radius * 1.2) * Math.cos(Math.PI * 2 * i / total) + "," + (radius * 1.2) * Math.sin(Math.PI * 2 * i / total) + ")";
        });
}

PopulateDropdowns().then(() => {
    DrawCourt();
    DrawRadarChart();
});
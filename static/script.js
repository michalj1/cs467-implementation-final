let shots = [];
let stats = [];

async function GetShots() {
    return await d3.csv("static/data/shots.csv");
}

async function GetStats() {
    return []
}

async function PopulateDropdowns() {
    shots = await GetShots();
    stats = await GetStats();

    const shotContainer = document.getElementById(`shot_container`);
    const playerSelect = document.getElementById('player_select');
    const seasonSelect = document.getElementById('season_select');
    const teamSelect = document.getElementById('team_select');

    // Get unique players, seasons, and teams
    let players = Array.from(new Set(shots.map(item => item['Player Name']))).sort();
    let seasons = Array.from(new Set(shots.map(item => item['Game Date'].substring(0, 4)))).sort().reverse(); // Assuming 'Game Date' is in YYYYMMDD format
    let teams = Array.from(new Set(shots.map(item => item['Team Name']))).sort();

    // Populate player dropdown
    playerSelect.innerHTML = players.map(player => `<option value="${player}">${player}</option>`).join('');
    playerSelect.addEventListener('change', () => DrawCourt());

    // Populate season dropdown
    seasonSelect.innerHTML = `<option value="All" selected>All Seasons</option>` + seasons.map(season => `<option value="${season}">${season}</option>`).join('');
    seasonSelect.addEventListener('change', () => DrawCourt());

    // Populate team dropdown
    teamSelect.innerHTML = `<option value="All" selected>All Teams</option>` + teams.map(team => `<option value="${team}">${team}</option>`).join('');
    teamSelect.addEventListener('change', () => DrawCourt());
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


PopulateDropdowns().then(() => DrawCourt());

let shots = [];
let stats = [];

async function GetShots() {
    return await d3.csv("data/shots.csv");
}

async function GetStats() {
    return []
}

async function PopulateDropdowns() {
    shots = await GetShots();
    stats = await GetStats();

    const shotContainer = document.getElementById(`shot_container`);
    const playerSelect = document.getElementById('player_select');

    let players = Array.from(new Set(shots.map(item => item.Player))).sort();

    playerSelect.innerHTML = players.map(player => `<option value="${player}">${player}</option>`).join('');
    playerSelect.addEventListener('change', () => DrawCourt());
}

function DrawCourt() {
    const shotContainer = document.getElementById(`shot_container`);
    const playerSelect = document.getElementById('player_select')
    const player = playerSelect.value;

    const playerShots = shots.filter(item => item.Player === player);
    
    // Make scatterplot of player shots on an image of a court
    // X position ranges from -250 to 250
    // Y position ranges from -52 at hoop to 418 at half court
    // Shots beyond half court have higher Y values, but should be ignored?

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
    shotContainer.getElementsByTagName('svg')[0].getElementsByTagName('g')[0].innerHTML = `<image href="data/court.png" height="${height}" width="${width}"/>`
        
    // Add X axis
    var x = d3.scaleLinear()
        .domain([-250, 250])
        .range([ 0, width ]);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-52, 418])
        .range([ height, 0]);

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(playerShots)
        .enter()
        .append("circle")
            .attr("cx", d => x(d.X_Position))
            .attr("cy", d => y(Math.min(d.Y_Position, 418)))
            .attr("r", 3)
            .attr("fill", d => {
                if (d.Shot_Made == 1) {
                    return "blue";
                } else {
                    return "red";
                }
            })
            .attr("fill-opacity", 0.3);
}

PopulateDropdowns().then(() => DrawCourt());

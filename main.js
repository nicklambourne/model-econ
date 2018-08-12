let max_x = 20;
let max_y = 20;
let demand = 0;
let supply = 0;

let getSupplyGradient = () => {
    return parseFloat(document.getElementById('s-elasticity').value);
};

let getSupplyIntercept = () => {
    return supply;
};

let getDemandGradient = () => {
    return -parseFloat(document.getElementById('d-elasticity').value);
};

let getDemandIntercept = () => {
    return max_y + demand;
};

let createSupply = () => {
    let intercept = getSupplyIntercept();
    let gradient = getSupplyGradient();
    let coordinates = [];
    for (let i = 0; i <= max_x; i++) {
        let x = i;
        let y = gradient * x + intercept;
        coordinates.push({x,y});
    }
    return coordinates
};

let createDemand = () => {
    let intercept = getDemandIntercept();
    let gradient = getDemandGradient();
    let coordinates = [];
    for (let i = 0; i <= max_x; i++) {
        let x = i;
        let y = gradient * x + intercept;
        coordinates.push({x,y});
    }
    return coordinates
};

let getEquilibriumX = () => {
    let demand_gradient = getDemandGradient();
    let demand_intercept = getDemandIntercept();
    let supply_gradient = getSupplyGradient();
    let supply_intercept = getSupplyIntercept();
    return (demand_intercept - supply_intercept) / (supply_gradient - demand_gradient);
};

let getEquilibriumY = () => {
    let demand_gradient = getDemandGradient();
    let demand_intercept = getDemandIntercept();
    let equilibrium_x = getEquilibriumX();
    return equilibrium_x * demand_gradient + demand_intercept;
};

let createEquilibrium = () => {
    return [{x: getEquilibriumX(), y: getEquilibriumY()}];
};

let createEquilibriumVertical = () => {
    let coordinates = [];
    let equilibrium_x = getEquilibriumX();
    let equilibrium_y = getEquilibriumY();
    coordinates.push({x: equilibrium_x, y: 0});
    coordinates.push({x: equilibrium_x, y: equilibrium_y});
    return coordinates;
};

let createEquilibriumHorizontal = () => {
    let coordinates = [];
    let equilibrium_x = getEquilibriumX();
    let equilibrium_y = getEquilibriumY();
    coordinates.push({x: 0, y: equilibrium_y});
    coordinates.push({x: equilibrium_x, y: equilibrium_y});
    return coordinates;
};

let getConsumerSurplus = () => {
    let demand_gradient = getDemandGradient();
    let demand_intercept = getDemandIntercept();
    let eq_x = getEquilibriumX();
    let eq_y = getEquilibriumY();
    return (demand_gradient/2) * Math.pow(eq_x, 2) + demand_intercept * eq_x - (eq_x*eq_y);
};

let getSupplierSurplus = () => {
    let supply_gradient = getSupplyGradient();
    let supply_intercept = getSupplyIntercept();
    let eq_x = getEquilibriumX();
    return (supply_gradient/2) * Math.pow(eq_x, 2) + supply_intercept * eq_x;
};

let ctx = document.getElementById("myChart");
let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [
            {
                data: createEquilibrium(),
                borderWidth: 4,
                pointRadius: 15,
                pointHoverRadius: 15,
                backgroundColor: 'rgba(20, 90, 50, 0.5)',
                fill: false,
            },
            {
                data: createSupply(),
                borderWidth: 4,
                borderColor: 'rgb(192, 57, 43)',
                pointRadius: 0,
                fill: false,
                label: 'Supply'
            },
            {
                data: createDemand(),
                borderWidth: 4,
                borderColor: 'rgb(0, 0, 161)',
                pointRadius: 0,
                fill: '+2',
                backgroundColor: 'rgba(0, 0, 161, 0.3)',
                label: 'Demand'
            },
            {
                data: createEquilibriumVertical(),
                borderWidth: 4,
                borderColor: 'rgba(20, 90, 50, 0.5)',
                pointRadius: 0,
                fill: false,
                borderDash: [5, 5],
            },
            {
                data: createEquilibriumHorizontal(),
                borderWidth: 4,
                borderColor: 'rgba(20, 90, 50, 0.5)',
                backgroundColor: 'rgba(192, 57, 43, 0.3)',
                pointRadius: 0,
                fill: '1',
                borderDash: [5, 5],
            }]
    },
    options: {

        legend: {
            display: true,
            labels: {
                filter: (legendItem, chartData) => {
                    return chartData.datasets[legendItem.datasetIndex].label;
                }
            },
            position: 'right'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: max_y
                },
                scaleLabel: {
                    labelString: 'Price ($)',
                    display: true
                }
            }],
            xAxes: [{
                id: 'x-axis',
                type: 'linear',
                position: 'bottom',
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: max_x
                },
                scaleLabel: {
                    labelString: 'Quantity (Units)',
                    display: true
                }
            }]
        },
        tooltips: {
            enabled: false
        }
    }
});

let updateChartData = () => {
    let dataSets = myChart.data.datasets;
    max_x = getEquilibriumX() * 2;
    max_y = getEquilibriumY() * 2;
    let options = myChart.options.scales;
    options.xAxes[0].ticks.max = max_x;
    options.yAxes[0].ticks.max = max_y;
    dataSets[0].data = createEquilibrium();
    dataSets[1].data = createSupply();
    dataSets[2].data = createDemand();
    dataSets[3].data = createEquilibriumVertical();
    dataSets[4].data = createEquilibriumHorizontal();
    myChart.update();
    document.getElementById('price').innerHTML = 'Equilibrium Price: $' + getEquilibriumY().toFixed(2).toString();
    document.getElementById('quantity').innerHTML = 'Equilibrium Quantity: ' + getEquilibriumX().toFixed(2).toString() + ' units';
    document.getElementById('c-surplus').innerHTML = 'Consumer Surplus: $' + getConsumerSurplus().toFixed(2).toString();
    document.getElementById('s-surplus').innerHTML = 'Supplier Surplus: $' + getSupplierSurplus().toFixed(2).toString();
};

let increaseDemand = () => {
    demand = Math.max(demand + 5, 0);
    updateChartData();
};

let decreaseDemand = () => {
    demand = Math.max(demand - 5, 0);
    updateChartData();
};

let increaseSupply = () => {
    supply = Math.max(supply + 5, 0);
    updateChartData();
};

let decreaseSupply = () => {
    supply = Math.max(supply - 5, 0);
    updateChartData();
};

document.getElementById('s-elasticity').onchange = updateChartData;
document.getElementById('d-elasticity').onchange = updateChartData;

document.getElementById('raise-demand').onclick = increaseDemand;
document.getElementById('lower-demand').onclick = decreaseDemand;
document.getElementById('raise-supply').onclick = increaseSupply;
document.getElementById('lower-supply').onclick = decreaseSupply;
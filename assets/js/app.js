//Create Figure
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
console.log(width, height)
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Defining Initial Parameters

var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

//Define Axis depending on Params
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
            d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
};

function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
            d3.max(censusData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
};

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};

// function used for updating circles group with a transition to new circles
function renderCircles(elementCircle, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    elementCircle.transition()
        .duration(1000)
        .attr("transform", function(d) {
            return `translate(${newXScale(d[chosenXAxis])},${newYScale(d[chosenYAxis])})`
        });

    return elementCircle;
};


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, elementCircle) {

    var labelX;
    var labelY;

    if (chosenXAxis === "poverty") {
        labelX = "Poverty (%):";
    } else if (chosenXAxis === "age") {
        labelX = "Age (Median):";
    } else {
        labelX = "Household Income (Median):";
    };

    if (chosenYAxis === "obesity") {
        labelY = "Obesity (%):";
    } else if (chosenYAxis === "smokes") {
        labelY = "Smokes (%):";
    } else {
        labelY = "Lacks Healthcare (%):";
    };

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
        });

    elementCircle.call(toolTip);

    elementCircle.on("mouseover", function(data) {
            toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return elementCircle;
};

d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    //parse Data
    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // Scale based on the Graphs
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);
    console.log(yLinearScale)

    //Create inital Axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //Append axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0,${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //Append Initial Circles
    var circlesGroup = chartGroup.selectAll("g")
        .data(censusData)
    var elementCircle = circlesGroup.enter()
        .append("g")
        .attr("transform", function(d) {
            return `translate(${xLinearScale(d[chosenXAxis])},${yLinearScale(d[chosenYAxis])})`
        });
    var circle = elementCircle.append("circle")
        .attr("r", 10)
        .attr("class", "stateCircle")
    var states = elementCircle.append("text")
        .attr("dx", 0)
        .attr("dy", 4)
        .attr("font-size", "10px")
        .attr("class", "stateText")
        .text(function(d) {
            return d.abbr
        });


    // Create group for x-axis labels
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2},${height+20})`);

    var labelsYGroup = chartGroup.append("g")
        .attr("transform", `translate(-30,${height/2})`);

    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty (%)");

    var ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    var obesityLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", 0)
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obesity (%)");

    var smokesLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 20)
        .attr("x", 0)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    //Update tooltip
    var elementCircle = updateToolTip(chosenXAxis, chosenYAxis, elementCircle);

    //x axis labels event listener
    labelsXGroup.selectAll("text").on("click", function() {
        //get value of selection
        var valueX = d3.select(this).attr("value");
        if (valueX !== chosenXAxis) {
            //replace chosenXAxis with value
            chosenXAxis = valueX;
            //update x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);
            //update x axis transition
            xAxis = renderXAxes(xLinearScale, xAxis);
            //update circles with new X values
            circlesGroup = renderCircles(elementCircle, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            //update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            //changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });

    labelsYGroup.selectAll("text").on("click", function() {
        //get value of selection
        var valueY = d3.select(this).attr("value");

        if (valueY !== chosenYAxis) {
            //replace chosenXAxis with value
            chosenYAxis = valueY;
            //update x scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);
            //update x axis transition
            yAxis = renderYAxes(yLinearScale, yAxis);
            //update circles with new X values
            circlesGroup = renderCircles(elementCircle, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            //update tooltips with new info
            var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            //changes classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else if (chosenYAxis === "smokes") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
}).catch(function(error) { console.log(error) });
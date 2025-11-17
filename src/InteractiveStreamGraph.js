import React, { Component } from "react";
import * as d3 from "d3";

class InteractiveStreamGraph extends Component {
    componentDidUpdate(){
    const chartData = this.props.csvData;
    console.log("Rendering chart with data:", chartData);
    // Don't render if data is empty
    if (!chartData || chartData.length === 0) {
        return;
    }
    
    // Define the LLM model names to visualize
    const llmModels = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"];

    const margin = {top: 20, right: 30, bottom: 30, left: 40};
        const width = 600 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;


        // Write the D3.js code to create the interactive streamgraph visualization here
        const stack = d3.stack().keys(llmModels).offset(d3.stackOffsetWiggle);
        const layers = stack(chartData);

        const xScale = d3.scaleTime().domain(d3.extent(chartData, d=>d.Date)).range([0, width]),
        yScale = d3.scaleLinear().domain([
        d3.min(layers, (layer) => d3.min(layer, (d) => d[0]-10)),
        d3.max(layers, (layer) => d3.max(layer, (d) => d[1])),
      ]).range([height, 0]);

        const colors = { "GPT-4": "#e41a1c", "Gemini": "#377eb8", "PaLM-2": "#4daf4a", "Claude": "#984ea3", "LLaMA-3.1": "#ff7f00" };

        const svg = d3.select(".svg_parent").append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const area = d3.area()
            .x(d => xScale(d.data.Date))
            .y0(d=> yScale(d[0]))
            .y1(d=> yScale(d[1]))
            .curve(d3.curveCardinal);

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("display", "none")
            .style("background", "#ecebeb")
            .style("border-radius", "5px")
            .style("padding", "4px");

        const tooltipSvg = tooltip.append("svg")
            .attr("width", 220)
            .attr("height", 120);

        svg.selectAll("path")
            .data(layers)
            .join("path")
            .attr("d", area)
            .attr("fill", (d, i) => colors[llmModels[i]])
            .attr("stroke", "none")
            .on("mousemove", function (event, layer) {
                const model = layer.key;
                const modelData = chartData.map(d => ({
                    date: d.Date,
                    value: d[model]
                }));

                tooltip.style("display", "block")
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);

                tooltipSvg.selectAll("*").remove();

                const margin = { top: 10, right: 10, bottom: 20, left: 30 };
                const w = 220 - margin.left - margin.right;
                const h = 120 - margin.top - margin.bottom;

                const g = tooltipSvg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                const x = d3.scaleBand()
                    .domain(modelData.map(d => d3.timeFormat("%b")(d.date)))
                    .range([0, w])
                    .padding(0.1);

                const y = d3.scaleLinear()
                    .domain([0, d3.max(modelData, d => d.value)])
                    .range([h, 0]);

                g.append("g")
                    .attr("transform", `translate(0,${h})`)
                    .call(d3.axisBottom(x).tickSize(5).tickPadding(4));

                g.append("g")
                    .call(d3.axisLeft(y).ticks(5).tickSize(5).tickPadding(4));

                g.selectAll("rect")
                    .data(modelData)
                    .enter()
                    .append("rect")
                    .attr("x", d => x(d3.timeFormat("%b")(d.date)))
                    .attr("y", d => y(d.value))
                    .attr("width", x.bandwidth())
                    .attr("height", d => h - y(d.value))
                    .attr("fill", colors[model]);
            })
            .on("mouseleave", () => {
                tooltip.style("display", "none");
            });

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

        const legend = d3.select(".svg_parent");

        llmModels.reverse().forEach((model, i) => {
            legend.append("rect")
                .attr("x", 620)
                .attr("y", 250 + i * 25)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", colors[model]);

            legend.append("text")
                .attr("x", 645)
                .attr("y", 264 + i * 25)
                .text(model)
                .style("font-size", "14px")
                .style("fill", "black");
        });
    }

  render() {
    return (
      <svg style={{ width: 750, height: 500 }} className="svg_parent">
        
      </svg>
    );
  }
}

export default InteractiveStreamGraph;

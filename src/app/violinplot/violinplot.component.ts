import { Component } from '@angular/core';
import {
  area,
  axisBottom,
  axisLeft,
  bin,
  curveCatmullRom,
  scaleBand,
  scaleLinear,
  select,
  group,
  max,
} from 'd3';
import { mockData, Data } from './mockData';

@Component({
  selector: 'app-violinplot',
  templateUrl: './violinplot.component.html',
  styleUrls: ['./violinplot.component.scss'],
})
export class ViolinplotComponent {
  // set the dimensions and margins of the graph
  private margin = { top: 10, right: 30, bottom: 30, left: 40 };
  private width = 460 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private data: Data = mockData;

  ngAfterViewInit() {
    // append the svg object to the body of the page
    select('#violinplot_canvas')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('id', 'violinplot')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    this.renderViolinplot();
    this.drawPlot;
  }
  // Build and Show the Y scale
  private y = scaleLinear<number>()
    .domain([3.5, 8]) // Note that here the Y scale is set manually
    .range([this.height, 0]);

  // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
  private x = scaleBand()
    .range([0, this.width])
    .domain(['setosa', 'versicolor', 'virginica'])
    .padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.

  private renderViolinplot() {
    select('#violinplot').append('g').call(axisLeft(this.y));

    select('#violinplot')
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(axisBottom(this.x));
  }

  // Features of the histogram
  private histogram = bin()
    .domain([3.5, 8])
    .thresholds(this.y.ticks(20)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
    .value((d) => d);

  private drawPlot() {
    // Compute the binning for each group of the dataset
    let sumstat = group('root', (d) => d.Species) // nest function allows to group the calculation per level of a factor
      .rollup((d: any) => {
        // For each key..
        let input = d.map((g) => {
          return g.Sepal_Length;
        }); // Keep the variable called Sepal_Length
        let bins = bin(input); // And compute the binning on it.
        return bins;
      })
      .entries(this.data);

    // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
    let maxNum = 0;
    for (let i in sumstat) {
      let allBins = sumstat[i].value;
      let lengths: number[] = allBins.map((a) => {
        return a.length;
      });
      let longuest = Number(max(lengths));
      if (longuest > maxNum) {
        maxNum = longuest;
      }
    }

    // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
    var xNum = scaleLinear()
      .range([0, this.x.bandwidth()])
      .domain([-maxNum, maxNum]);

    // Add the shape to this svg!
    select('#violinplot')
      .selectAll('myViolin')
      .data(sumstat)
      .enter() // So now we are working group per group
      .append('g')
      .attr('transform', (d: any) => {
        return 'translate(' + this.x(d.key) + ' ,0)';
      }) // Translation on the right to be at the group position
      .append('path')
      .datum(function (d: any) {
        return d.value;
      }) // So now we are working bin per bin
      .style('stroke', 'none')
      .style('fill', '#69b3a2')
      .attr(
        'd',
        area()
          .x0(function (d) {
            return xNum(-d.length);
          })
          .x1(function (d) {
            return xNum(d.length);
          })
          .y((d: any) => {
            return this.y(d.x0);
          })
          .curve(curveCatmullRom) // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
      );
  }
}

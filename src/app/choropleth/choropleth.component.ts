import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { geoMercator } from 'd3-geo';
import { geoPath } from 'd3';
import { mapData } from './map-data';

@Component({
  selector: 'app-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss'],
})
export class ChoroplethComponent implements AfterViewInit {
  /*
    private svg;
    private height: number;
    private width: number;
    private projection;
  */

  width = 1000;
  height = 600;
  initialScale = 200;

  lastScale = 0;
  centerX = 0;
  centerY = 0;
  lastCenterX = 0;
  lastCenterY = 0;

  countryColors = [];

  projection = geoMercator().scale(this.initialScale).center([0, 0]);

  zoom = () =>
    d3
      .zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event: any) => {
        const features = d3.selectAll('.country');
        const t = event.transform;

        const scale = t.k * this.initialScale;
        const centerY = t.y;
        const centerX = t.x;
        let updated = false;

        if (scale !== this.lastScale) {
          this.projection.scale(scale);
          this.lastScale = scale;
          updated = true;
        }
        if (centerX !== this.lastCenterX || centerY !== this.lastCenterY) {
          // this.projection.center([centerY, centerX]);
          updated = true;
          console.log(this.projection.scale(), scale, t.k, t.y);
        }

        if (updated) {
          const path = d3.geoPath().projection(this.projection);
          features.attr('d', path.toString);
        }
      });

  ngAfterViewInit() {
    this.renderMap();
  }

  renderMap() {
    const svg = d3.select('#mapCanvas');

    svg.attr('width', this.width).attr('height', this.height).append('g');
    svg.call(this.zoom);
    this.redraw();
  }

  redraw() {
    const svg = d3.select('#mapCanvas');
    const path = d3.geoPath().projection(this.projection);

    console.log(mapData.features);
    console.log(path);

    svg
      .selectAll('path')
      .data(mapData.features)
      .enter()
      .join('path')
      .attr('d', path)
      .attr('class', 'country')
      .attr('fill', '#862727')
      .attr('stroke', '#181164')
      .attr('stroke-width', 0.2)
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.hoverHandler(event);
      })
      .on('mouseout', (event: MouseEvent, d: any) => {
        this.hoverHandler(event, d);
      });
  }

  hoverHandler(event: MouseEvent, d?: any) {
    // @ts-ignore
    const node = d3.select(event.currentTarget);
    if (d) {
      node.attr('fill', '#2c33af');
    } else {
      node.attr('fill', 'rgba(255, 255, 0, 0.25)');
    }
  }

  /*constructor() {
  this.svg = select('svg');
  this.width = +this.svg.attr('width');
  this.height = +this.svg.attr('height');
}
ngOnInit() {
  this.prepareChoropleth();
  this.drawChoropleth();
}

prepareChoropleth() {
  // Map and projection
  const path = geoPath();
  const projection = geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([this.width / 2, this.height / 2]);

  // Data and color scale
  const data = map();
  const colorScale = scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(schemeBlues[6]);
}

private drawChoropleth() {
  this.svg
    .append('g')
    .selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    // draw each country
    .attr('d', geoPath().projection(this.projection))
    // set the color of each country
    .attr('fill', function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    });
}*/
}

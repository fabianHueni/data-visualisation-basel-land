import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { GeoPath } from 'd3-geo';
import { mapData } from './map-data';
import {
  geoPath,
  geoTransform,
  interpolateBlues,
  scaleLinear,
  select,
} from 'd3';
import bbox from '@turf/bbox';
import { Selection } from 'd3-selection';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss'],
})
export class ChoroplethComponent implements AfterViewInit {
  public tooltipData: any = null;

  @Input()
  public tooltipRef?: TemplateRef<any>;

  @Input()
  public colorInterpolation: (d: any) => string = (d) => '';

  @Input()
  public changSubject: Subject<boolean> | undefined;

  @ViewChild('mapWrapper')
  public mapWrapper: ElementRef | undefined;

  private tooltip: Selection<any, any, any, any> | undefined;

  /**
   * The width of the svg-canvas. Depends on the available space.
   * @private
   */
  private width = 0;

  /**
   * The hight of the svg-canvas. Depends on the available space.
   * @private
   */
  private height = 0;

  /**
   * The path generator for the choropleth. Needs to convert the LV95 coordinates to
   * coordinates on the svg-canvas.
   * @private
   */
  private pathGenerator: GeoPath<any, any> | null = null;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.width = this.mapWrapper?.nativeElement.offsetWidth;
    this.constructTooltip();
    this.constructPathGenerator();
    this.renderMap();

    this.changSubject?.subscribe((_) => {
      this.redraw();
      this.drawLegend();
    });
  }

  /**
   * Render the initial map
   */
  private renderMap() {
    select('#mapCanvas')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

    this.drawLegend();
    this.redraw();
  }

  private drawLegend() {
    const size = 20;
    select('#legend')
      .attr('width', this.width)
      .attr('height', 40)
      .selectAll('legendRect')
      .data([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
      .enter()
      .append('rect')
      .attr('y', 0)
      .attr('x', (d, i) => {
        return this.width - 40 - i * (size + 2);
      })
      .attr('height', size)
      .attr('width', size)
      .style('fill', (d) => interpolateBlues(d));
  }

  private redraw() {
    select('#mapCanvas').selectAll('path').remove();

    select('#mapCanvas')
      .selectAll('path')
      .data(mapData.features)
      .enter()
      .append('path')
      .attr('d', this.pathGenerator)
      .attr('class', 'municipality')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.5)
      .attr('fill', (d) => {
        return this.colorInterpolation(d);
      })
      .on('mouseover', (event: MouseEvent) => {
        this.mouseover(event);
      })
      .on('mouseout', (event: MouseEvent) => {
        this.mouseleave(event);
      })
      .on('mousemove', (event: MouseEvent, data: any) =>
        this.mousemove(event, data)
      )
      .on('click', (event: MouseEvent, data: any) => {
        this.router.navigate(['gemeinde', data.properties.gemeinde_id_bfs]);
      });
  }

  /**
   * Show the tooltip when the mouse is over a shape and restyle the border (stroke) of the current shape.
   *
   * @param event The mouse event to get the current target and therefore the correct shape.
   * @private
   */
  private mouseover(event: MouseEvent) {
    this.tooltip?.style('opacity', 1);

    // @ts-ignore
    select(event.currentTarget)
      .style('stroke', 'black')
      .style('stroke-width', 3);
  }

  /**
   * When the mouse move, update the tooltip text with the correct data and set the new position of the tooltip.
   *
   * @param event The mouse event to get the current position of the mouse
   * @param data The feature of the hovered shape from the geojson file
   * @private
   */
  private mousemove(event: MouseEvent, data: any) {
    this.tooltipData = data;
    this.tooltip
      ?.style('left', event.pageX + 15 + 'px')
      .style('top', event.pageY + 'px');
  }

  /**
   * Hide the tooltip and reset the border (stroke) of the shape when the mouse leaf a municipality.
   *
   * @param event Mouse Event to get the current target of the mouse
   * @private
   */
  private mouseleave(event: MouseEvent) {
    this.tooltip?.style('opacity', 0);

    // @ts-ignore
    select(event.currentTarget)
      .style('stroke', 'gray')
      .style('stroke-width', 0.5);
  }

  /**
   * Construct the path generator with projection for the LV95 swiss coordinates according to the tutorial
   * of Benja Zehr on {@link https://blog.az.sg/posts/mapping-switzerland-2/}.
   *
   * @private
   */
  private constructPathGenerator() {
    const [maxX, maxY, minX, minY] = bbox(mapData);
    this.height = ((maxY - minY) / (maxX - minX)) * this.width;

    const x = scaleLinear().range([0, this.width]).domain([maxX, minX]);
    const y = scaleLinear().range([0, this.height]).domain([minY, maxY]);

    const projection = geoTransform({
      point: function (px, py) {
        this.stream.point(x(px), y(py));
      },
    });

    this.pathGenerator = geoPath<any>().projection(projection);
  }

  /**
   * Construct the initial tooltip with a new div appended to the DOM.
   * Does have more styles from the css class.
   *
   * @private
   */
  private constructTooltip() {
    this.tooltip = select('#tooltip')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
  }
}

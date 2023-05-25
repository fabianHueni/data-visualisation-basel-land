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
import { geoPath, geoTransform, scaleLinear, select } from 'd3';
import bbox from '@turf/bbox';
import { Selection } from 'd3-selection';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss'],
})
export class ChoroplethComponent implements AfterViewInit {
  /**
   * A unique id to identify the svg elements of this component.
   * Necessary to avoid selection conflicts with multiple equal id's.
   */
  readonly plotId = `plot-${uuid()}`;

  /**
   * A reference to the tooltip template. Will be displayed on hover in a wrapped div.
   */
  @Input()
  public tooltipTemplate?: TemplateRef<any>;

  /**
   * A callback function to get the color for a given shape. The color depends on the values of the data.
   *
   * @param d The data from the shape to get the color
   */
  @Input()
  public colorCallback: (d: any) => string = (_) => '';

  /**
   * A subject to get notified when to redraw the map.
   * Is necessary due to the data changes in the parent component and this component does not know about the data.
   * Especially the color of the shapes needs to be updated.
   */
  @Input()
  public changSubject: Subject<boolean> | undefined;

  /**
   * The wrapper div of this plot. Is needed to get the width and create a responsive plot.
   */
  @ViewChild('mapWrapper')
  public mapWrapper: ElementRef | undefined;

  /**
   * The data to show in the tooltip of the choropleth.
   */
  public tooltipData: any = null;

  /**
   * The tooltip element in which the tooltip content is displayed.
   * @private
   */
  private tooltip: Selection<any, any, any, any> | undefined;

  /**
   * The width of the svg-canvas. Depends on the available space.
   * @private
   */
  private width = 0;

  /**
   * The height of the svg-canvas. Depends on the available space.
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
    this.setupChoropleth();

    this.changSubject?.subscribe((_) => {
      this.redraw();
    });
  }

  /**
   * Render the initial map and set the correct width and size.
   */
  private setupChoropleth() {
    select('#' + this.plotId + '-choropleth')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

    this.redraw();
  }

  /**
   * Remove and redraw the full choropleth. We do this when the data is changed in the parent component.
   * @private
   */
  private redraw() {
    select('#' + this.plotId + '-choropleth')
      .selectAll('path')
      .remove();

    select('#' + this.plotId + '-choropleth')
      .selectAll('path')
      .data(mapData.features)
      .enter()
      .append('path')
      .attr('d', this.pathGenerator)
      .attr('class', 'municipality')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.5)
      .attr('fill', (d) => {
        return this.colorCallback(d);
      })
      .on('mouseover', (event: MouseEvent, data: any) => {
        this.mouseHover(event, data);
      })
      .on('mousemove', (event: MouseEvent, data: any) =>
        this.mouseHover(event, data)
      )
      .on('mouseout', (event: MouseEvent) => {
        this.mouseLeave(event);
      })
      .on('click', (event: MouseEvent, data: any) => {
        this.router.navigate(['gemeinde', data.properties.gemeinde_id_bfs]);
      });
  }

  /**
   * When the mouse hover a shape, update the tooltip text with the correct data and set the new position of the tooltip.
   *
   * @param event The mouse event to get the current position of the mouse
   * @param data The feature of the hovered shape from the geojson file
   * @private
   */
  private mouseHover(event: MouseEvent, data: any) {
    this.tooltip?.style('display', 'block');

    // @ts-ignore
    select(event.currentTarget)
      .style('stroke', 'black')
      .style('stroke-width', 3);

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
  private mouseLeave(event: MouseEvent) {
    this.tooltip?.style('display', 'none');

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
    this.tooltip = select('#' + this.plotId + '-tooltip')
      .style('opacity', 1)
      .style('display', 'none')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
  }
}

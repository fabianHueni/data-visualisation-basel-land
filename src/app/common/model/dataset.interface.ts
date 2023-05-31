import { interpolateOranges } from 'd3-scale-chromatic';
import { TemplateRef } from '@angular/core';
import { InternMap } from 'd3';

export interface Dataset {
  label: string;
  value: string;
  data: (year: number) => InternMap;
  color: (data: any) => string;
  colorScheme: (t: number) => string;
  tooltipRef: () => TemplateRef<any> | undefined;
  legendTitle: string;
  min: number;
  max: number;
}

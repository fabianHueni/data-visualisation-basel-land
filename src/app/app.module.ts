import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar/navbar.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { PopulationService } from './common/service/population.service';
import { ChoroplethComponent } from './choropleth/choropleth.component';
import { AboutComponent } from './about/about.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { DataComponent } from './data/data.component';
import { HomeComponent } from './home/home.component';
import { MunicipalityComponent } from './municipality/municipality.component';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { FooterComponent } from './footer/footer.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { LegendComponent } from './legend/legend.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { registerLocaleData } from '@angular/common';
import localeCH from '@angular/common/locales/de-CH';
import { KeyNumbersComponent } from './key-numbers/key-numbers.component';
import { ButtonModule } from 'primeng/button';
import { LineChartComponent } from './line-chart/line-chart.component';
import { DevelopmentOverTimeComponent } from './municipality/development-over-time/development-over-time.component';

/**
 * Load the data for the visualizations bevor startup the app
 */
function initializeApp(populationService: PopulationService) {
  return () => populationService.initializeData();
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AboutComponent,
    DocumentationComponent,
    DataComponent,
    HomeComponent,
    MunicipalityComponent,
    HeatmapComponent,
    ChoroplethComponent,
    FooterComponent,
    LegendComponent,
    KeyNumbersComponent,
    LineChartComponent,
    DevelopmentOverTimeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TabMenuModule,
    CardModule,
    DropdownModule,
    FormsModule,
    SliderModule,
    SelectButtonModule,
    InputNumberModule,
    RadioButtonModule,
    FontAwesomeModule,
    ButtonModule,
  ],
  providers: [
    PopulationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [PopulationService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(localeCH, 'de-CH');
  }
}

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


/**
 * Load the data for the visualizations bevor startup the app
 */
function initializeApp(populationService: PopulationService) {
  return () => populationService.initializeData();
}

@NgModule({
  declarations: [AppComponent, NavbarComponent, AboutComponent, ChoroplethComponent, DocumentationComponent, DataComponent, HomeComponent, MunicipalityComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TabMenuModule,
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
export class AppModule {}

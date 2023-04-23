import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar/navbar.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { PopulationService } from './common/service/population.service';
import { ChoroplethComponent } from './choropleth/choropleth.component';

/**
 * Load the data for the visualizations bevor startup the app
 */
function initializeApp(populationService: PopulationService) {
  return () => populationService.initializeData();
}

@NgModule({
  declarations: [AppComponent, NavbarComponent, ChoroplethComponent],
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

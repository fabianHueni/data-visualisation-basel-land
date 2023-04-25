import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { DataComponent } from './data/data.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { MunicipalityComponent } from './municipality/municipality.component';

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'daten',
    component: DataComponent,
  },
  {
    path: 'dokumentation',
    component: DocumentationComponent,
  },
  {
    path: 'gemeinde/:id',
    component: MunicipalityComponent,
  },
  {
    path: '**',
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

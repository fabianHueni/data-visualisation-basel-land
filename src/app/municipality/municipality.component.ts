import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopulationService } from '../common/service/population.service';

@Component({
  selector: 'app-municipality',
  templateUrl: './municipality.component.html',
  styleUrls: ['./municipality.component.scss'],
})
export class MunicipalityComponent implements OnInit {
  public municipalityId = 2859;
  public municipalityName = 'unknown';

  constructor(
    private route: ActivatedRoute,
    private popService: PopulationService
  ) {}

  ngOnInit() {
    /*     this.route.queryParams.subscribe(
      (params) => (this.municipalityId = params['id'])
    ); */
    this.municipalityName = this.popService.getMunicipalityName(
      this.municipalityId ? this.municipalityId : 2829
    );
  }
}

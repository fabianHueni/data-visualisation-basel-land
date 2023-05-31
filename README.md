# Open Data Visualization Basel-Land

## About

This data visualization was implemented by Linda Hoch and Fabian Hüni as part of the bachelor lecture [Implementation of
an Open Data Project](https://www.digitale-nachhaltigkeit.unibe.ch/studium/open_data_veranstaltung/fruehjahrssemester_2023/index_ger.html)
of the Research Center Digital Sustainability at the University of Bern in the spring semester 2023.
Our team was supported by Daria Moser from
the [Open Government Data (OGD) department of the Canton of Basel-Landschaft](https://www.baselland.ch/politik-und-behorden/direktionen/finanz-und-kirchendirektion/statistisches-amt/ogd).

The app was developed with D3.js, Angular and PrimeNG. The source code is available under the free GPL-3.0 license on
GitHub.

### Data

This visualization is based on the population data of the Canton of Basel-Landschaft, which is available under a free
license (Open Data). The app uses the dataset [population by gender, age, municipality and year (from 2003)](https://data.bl.ch/explore/dataset/10010/table/?sort=-jahr) which is
available on the [Open Data Portal of the Canton of Basel-Landschaft](https://data.bl.ch/). The data was downloaded in
April 2022 and not modified. Only the file size was reduced by removing unneeded columns. The data set, which has been shortened for
this app, is available in this project under `src/assets/data`.

### Disclaimer

The data displayed in this visualization has been calculated and presented to the best of our knowledge. The focus of
this app is on the visualization and not the preparation and processing of the data. No responsibility is taken for the
accuracy of the visualized data.

## Development
Due to the lack of time the code is a bit messy and not well documented. We are sorry for that. :-) 

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you
change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `docs/` directory.

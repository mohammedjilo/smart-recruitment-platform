# GeoNames populated places

`cities500.json.gz` is generated from GeoNames `cities500.zip`, filtered to
populated-place (`P`) feature records. The generator also downloads
`admin1CodesASCII.txt` and `admin2Codes.txt` to add administrative names for
disambiguating places with the same name.

GeoNames describes `cities500.zip` as cities with population over 500 or
administrative seats through PPLA4 (approximately 185,000 records). It is a
practical worldwide populated-place set, not an exhaustive gazetteer: smaller
settlements and places omitted or stale in GeoNames are not included. The
backend returns bounded, country-scoped search results; it does not send this
entire dataset to clients or store it in Prisma.

Source: [GeoNames export downloads](https://download.geonames.org/export/dump/)
and [GeoNames data terms](https://www.geonames.org/export/). The GeoNames
readme licenses the data under [Creative Commons Attribution 4.0
(CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). Attribute the data
to GeoNames when using or redistributing this dataset. GeoNames provides the
data as-is without warranty of accuracy, timeliness, or completeness.

Regenerate the committed gzip artifact from the current upstream files with:

```sh
npm run update:geonames --workspace back
```

The generated artifact reflects the upstream data available on the date the
generator is run; check upstream terms and coverage before each redistribution.

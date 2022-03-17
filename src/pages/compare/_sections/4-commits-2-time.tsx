import Section from "./common/section";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import {InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import HeatMapChartCard from "../../../components/RemoteCards/HeatMapChartCard";
import {getRandomColor} from "../../../lib/color";
import React, {useCallback, useState} from "react";
import Typography from "@mui/material/Typography";
import TextCard from "../../../components/RemoteCards/TextCard";

const zones: number[] = [
]

for (let i = -12; i <= 13; i++) {
  zones.push(i)
}

export default function () {
  const [zone, setZone] = useState(0);

  const onZoneChange = useCallback((e) => {
    setZone(e.target.value)
  }, [setZone])

  return (
    <Section
      title='title'
      description={(
        <TextCard height="auto">
          <>
            <Typography variant="h6" gutterBottom>
              Commits Time Distribution
            </Typography>
            <Typography variant="body1">
              Commits time distribution describes the number of push events of the repository in different
              periods.
            </Typography>
            <ul>
              <Typography variant="body1" component="li">The X-axis is 0 ~ 24 hours divided according to GMT(UTC+00:00) time zone</Typography>
              <Typography variant="body1" component="li">The Y-axis is day of week, 0 means Sunday, 1 means Monday, and so on...</Typography>
            </ul>
            <Typography variant="body1">
              We use the <a href="https://en.wikipedia.org/wiki/Heat_map">heatmap</a> to indicate the frequency of the
              code <a href="https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#pushevent">PUSH</a> event on this time node.
              By analyzing the main distribution area of the large circle, we can roughly learn that the open-source
              repository is mainly the developers in that area in activities.
            </Typography>
            <ul>
              <Typography variant="body1" component="li">
                If the hot spots are mainly concentrated on the Y-axis working day, then this open-source repository
                is likely to be an open-source project whose main contribution comes from one or two companies.
              </Typography>
              <Typography variant="body1" component="li">
                If the hot spots are mainly concentrated on the X-axis 2 - 14h (corresponding to 10 to 22h of GMT+8),
                then developers of this open-source repository may be mainly in the eastern hemisphere.
              </Typography>
              <Typography variant="body1" component="li">
                If the hot spots are concentrated on the X-axis 14h - 2h (+1) (corresponding to 2 to 18h of GMT-8),
                then developers of this open-source repository may be mainly in the western hemisphere.
              </Typography>
            </ul>
          </>
        </TextCard>
      )}
    >
      {({ repo1, repo2, allProvidedRepos, allReposProvided, dateRange }) => (
        <Grid container>
          <Grid xs={12}>
            <Box sx={{ minWidth: 120, textAlign: 'center' }}>
              <FormControl size='small'>
                <InputLabel id="zone-select-label">Timezone (UTC)</InputLabel>
                <Select
                  labelId="zone-select-label"
                  id="zone-select"
                  value={zone}
                  label="Timezone (UTC)"
                  onChange={onZoneChange}
                  sx={{ minWidth: 120 }}
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone} value={zone}>
                      {zone > 0 ? `+${zone}` : zone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item md={6} sm={6} xs={12}>
            <HeatMapChartCard
              title={'Commits Time Distribution'}
              queryName={"commits-time-distribution"}
              params={{
                repoId: repo1?.id,
                dateRange: dateRange
              }}
              shouldLoad={allReposProvided([repo1])}
              noLoadReason="Need select repo."
              xAxisColumnName="hour"
              yAxisColumnName="dayofweek"
              valueColumnName="pushes"
              series={allProvidedRepos([repo1]).map((r) => {
                return {
                  name: r.name,
                  color: r.color || getRandomColor(),
                  axisLabel: {
                    formatter: '{yyyy} {MMM}'
                  }
                };
              })}
              height="700px"
              zone={zone}
              onZoneChange={onZoneChange}
            />
          </Grid>
          <Grid item md={6} sm={6} xs={12}>
            <HeatMapChartCard
              title={'Commits Time Distribution'}
              queryName={"commits-time-distribution"}
              params={{
                repoId: repo2?.id,
                dateRange: dateRange
              }}
              shouldLoad={allReposProvided([repo2])}
              noLoadReason="Need select repo."
              xAxisColumnName="hour"
              yAxisColumnName="dayofweek"
              valueColumnName="pushes"
              series={allProvidedRepos([repo2]).map((r) => {
                return {
                  name: r.name,
                };
              })}
              height="700px"
              zone={zone}
              onZoneChange={onZoneChange}
            />
          </Grid>
        </Grid>
      )}
    </Section>
  )
}
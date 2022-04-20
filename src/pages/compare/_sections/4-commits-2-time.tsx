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
      title='Heat Map of Commits Time'
      description={(
        <>
          <Typography variant="body1">
            The <b>Heat Maps</b> below describe the number of push events that occur at a particular point of time (UTC). For each day and hour, the colored boxes indicate the number of push events. The lighter the color, the fewer push events; the darker the color, the more push events. 
          </Typography>
          <br />
          <Typography variant="body1">
            You can learn from this heat map what time is the busiest for contributors, and which country or region distributes the most contributors.
          </Typography>
        </>
      )}
    >
      {({ repo1, repo2, allProvidedRepos, allReposProvided, dateRange }) => (
        <Grid container>
          <Grid xs={12}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl size='small'>
                <InputLabel id="zone-select-label">Timezone (UTC)</InputLabel>
                <Select
                  labelId="zone-select-label"
                  id="zone-select"
                  value={zone}
                  label="Timezone (UTC)"
                  onChange={onZoneChange}
                  sx={{ minWidth: 120 }}
                  variant='standard'
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

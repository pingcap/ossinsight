import React, { useCallback } from 'react';
import CustomPage from '@site/src/theme/CustomPage';
import { Alert, Container, FormControlLabel, Switch, Typography } from '@mui/material';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';

function ExperimentalPage () {
  return (
    <CustomPage>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2">
          OSSInsight experimental features
        </Typography>
        <Alert severity="warning" sx={{ my: 2 }}>
          <Typography variant="body1">
            These features are not prepared yet, some features may not work for now.
          </Typography>
        </Alert>
        <div>
          <FormControlLabel
            label="Milestone Subscription"
            control={<ExperimentalSwitch feature="milestone-subscription" />}
          />
          <br />
          <FormControlLabel
            label="AI Playground"
            control={<ExperimentalSwitch feature="ai-playground" />}
          />
        </div>
      </Container>
    </CustomPage>
  );
}

function ExperimentalSwitch ({ feature }: { feature: string }) {
  const [enabled, enable] = useExperimental(feature);

  return (
    <Switch checked={enabled} onChange={useCallback((_, checked) => enable(checked), [enable])}></Switch>
  );
}

const Page = process.env.NODE_ENV === 'development' ? ExperimentalPage : NotFound;

export default Page;

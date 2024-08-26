import CustomPage from '@site/src/theme/CustomPage';
import React from 'react';
import { ClaimCredits } from '@site/src/pages/gift/_components/ClaimCredits';

export default function Page () {
  return (
    <CustomPage title="Gift for OSS Contributors">
      <ClaimCredits/>
    </CustomPage>
  );
}

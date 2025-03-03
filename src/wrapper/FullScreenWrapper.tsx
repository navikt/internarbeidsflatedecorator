import React from 'react';
import '@navikt/ds-css';
import LandingPage from '../LandingPage';

const FullScreenWrapper = () => {
  // En minimal Decorator som viser en fullskjermvisning av applikasjonen
  return (
    <LandingPage
      appName="Test app"
      enableHotkeys
      showEnheter={true}
      showSearchArea={true}
      showHotkeys={true}
      environment={'q2'}
      urlFormat={'LOCAL'}
      enhet={''}
      fnr={''}
      fetchActiveEnhetOnMount
      fetchActiveUserOnMount
      onEnhetChanged={() => {}}
      onFnrChanged={() => {}}
    />
  );
};

export default FullScreenWrapper;

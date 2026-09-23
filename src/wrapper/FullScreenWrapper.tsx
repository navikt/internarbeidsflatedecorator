import React from 'react';
import '../web-component';

const FullScreenWrapper = () => {
  // En minimal dekoratør som viser en fullskjermvisning av applikasjonen, rendes som web component
  return (
    <internarbeidsflate-decorator-fullscreen
      app-name="Test app"
      environment="q2"
      url-format="LOCAL"
      enable-hotkeys
      show-enheter
      show-search-area
      show-hotkeys
      fetch-active-enhet-on-mount
      fetch-active-user-on-mount
    />
  );
};

export default FullScreenWrapper;

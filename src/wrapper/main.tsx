import React from 'react';
import ReactDOM from 'react-dom/client';
import Wrapper from './Wrapper';
import FullScreenWrapper from './FullScreenWrapper';

// Preview-dekoratøren bruker `dr:`-utilities og trenger derfor css bundle dekoratøren henter
// sine egne stiler gjennom shadow root, så dette påvirker ikke den — og importen ligger her,
// ikke i Decorator.tsx, som ville lekket stiler til vertsappens <head> (se 4f1b475).
import '../index.bundled.css';

const isFullscreen = import.meta.env.VITE_DECORATOR_MODE === 'fullscreen';

const enableMock = async () => {
  if (!import.meta.env.DEV) return;

  const { worker } = await import('../__mocks__/browser');

  return worker.start();
};

await enableMock();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isFullscreen ? <FullScreenWrapper /> : <Wrapper />}
  </React.StrictMode>,
);

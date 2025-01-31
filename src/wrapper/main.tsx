import React from 'react';
import ReactDOM from 'react-dom/client';
import Wrapper from './Wrapper';
import FullScreenWrapper from './FullScreenWrapper';

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

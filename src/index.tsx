import SafeProvider from '@gnosis.pm/safe-apps-react-sdk';
import { CircularProgress, GlobalStyles, ThemeProvider, Typography } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import initTheme from './theme';

const isSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const theme = initTheme(isSystemDarkMode());

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{
          body: {
            height: '100%',
            margin: '0px',
            padding: '0px',
          },
        }}
      />
      <SafeProvider
        loader={
          <>
            <Typography variant="h1">Waiting for Safe...</Typography>
            <CircularProgress size="md" />
          </>
        }
      >
        <App />
      </SafeProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

import SafeProvider from '@gnosis.pm/safe-apps-react-sdk';
import { theme, Loader, Title } from '@gnosis.pm/safe-react-components';
import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';

import App from './App';
import GlobalStyle from './GlobalStyle';

ReactDOM.render(
  // You may have been encountering too many re-renders by using StrictMode. It runs every effect twice.
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SafeProvider
        loader={
          <>
            <Title size="md">Waiting for Safe...</Title>
            <Loader size="md" />
          </>
        }
      >
        <App />
      </SafeProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

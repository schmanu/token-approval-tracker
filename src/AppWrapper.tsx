import { CircularProgress, CssBaseline, Theme, ThemeProvider, Typography } from '@mui/material';
import SafeProvider from '@safe-global/safe-apps-react-sdk';
import { SafeThemeProvider } from '@safe-global/safe-react-components';

import App from './App';
import { useDarkMode } from './hooks/useDarkMode';

export const AppWrapper = () => {
  const isDarkMode = useDarkMode();
  const themeMode = isDarkMode ? 'dark' : 'light';

  return (
    <SafeThemeProvider mode={themeMode}>
      {(safeTheme: Theme) => (
        <ThemeProvider theme={safeTheme}>
          <CssBaseline />
          <SafeProvider
            loader={
              <>
                <Typography>Waiting for Safe...</Typography>
                <CircularProgress />
              </>
            }
          >
            <App />
          </SafeProvider>
        </ThemeProvider>
      )}
    </SafeThemeProvider>
  );
};

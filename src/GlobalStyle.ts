import avertaBoldFont from '@gnosis.pm/safe-react-components/dist/fonts/averta-bold.woff2';
import avertaFont from '@gnosis.pm/safe-react-components/dist/fonts/averta-normal.woff2';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    html {
        height: 100%
    }

    body {
       height: 100%;
       margin: 0px;
       padding: 0px;
    }

    #root {
        height: 100%;
        padding-right: 0.5rem;
    }

    .MuiFormControl-root,
    .MuiInputBase-root {
        width: 100% !important;
    }

    .MuiSelect-root div p {
        font-size: 14px;
    }

    @font-face {
        font-family: 'Averta';
        src: local('Averta'), local('Averta Bold'),
        url(${avertaFont}) format('woff2'),
        url(${avertaBoldFont}) format('woff');
    }
`;

export default GlobalStyle;

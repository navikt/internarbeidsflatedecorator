import 'react-app-polyfill/stable';
import NAVSPA from '@navikt/navspa';
import Application from './application';
import './styles/nav-frontend.css';
import { ApplicationProps } from './domain';
import { isMock } from './utils/test.utils';
import './styles/tailwind.css';
import '@navikt/ds-css';

if (isMock) {
    import('./mock');
}

NAVSPA.eksporter<ApplicationProps>('internarbeidsflatefs', Application);

import './index.bundled.css';
import Navspa from '@navikt/navspa';
import Decorator from './Decorator';
import LandingPage from './LandingPage';

Navspa.eksporter('internarbeidsflate-decorator-v3', Decorator);
Navspa.eksporter('internarbeidsflate-decorator-v3-fullscreen', LandingPage);

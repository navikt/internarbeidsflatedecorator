import Application from './application';
import NAVSPA from './utils/NAVSPA';
import './styles/main.less';

if (process.env.REACT_APP_MOCK === 'true') {
    require('./mock');
}


NAVSPA.eksporter("internarbeidsflatefs", Application);

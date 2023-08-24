import React, { useCallback, useRef } from 'react';
import { Dispatch } from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { State } from './redux';
import { SagaActions, SagaActionTypes } from './redux/actions';
import { ApplicationProps } from './domain';
import Banner from './components/banner';
import Lenker from './components/lenker';
import NyEnhetContextModal from './components/modals/ny-enhet-context-modal';
import NyBrukerContextModal from './components/modals/ny-bruker-context-modal';
import Feilmelding from './components/feilmelding';
import { useWrappedState, WrappedState } from './hooks/use-wrapped-state';
import useOnClickOutside from './hooks/use-on-click-outside';
import { useOnMount } from './hooks/use-on-mount';
import { useOnChanged } from './hooks/use-on-changed';
import { getContextvalueValue, isContextvalueControlled, RESET_VALUE } from './redux/utils';
import { DecoratorHotkeysProvider } from './components/hurtigtaster/hurtigtaster';

function Application(props: ApplicationProps) {
    const dispatch = useDispatch<Dispatch<SagaActions>>();
    const isFnrControlled = useRef(isContextvalueControlled(props.fnr));
    const isEnhetControlled = useRef(isContextvalueControlled(props.enhet));
    useOnMount(() => {
        dispatch({ type: SagaActionTypes.INIT, data: props });
    });

    useOnChanged(
        () => getContextvalueValue(props.fnr),
        () => {
            if (!isFnrControlled.current) {
                return;
            }
            const nyFnr = getContextvalueValue(props.fnr);
            if (nyFnr === null || nyFnr === RESET_VALUE || nyFnr.trim().length === 0) {
                dispatch({ type: SagaActionTypes.FNRRESET });
            } else {
                dispatch({ type: SagaActionTypes.FNRSUBMIT, data: nyFnr });
            }
        }
    );
    useOnChanged(
        () => getContextvalueValue(props.enhet),
        () => {
            if (!isEnhetControlled.current) {
                return;
            }
            const nyEnhet = getContextvalueValue(props.enhet);
            if (nyEnhet !== null) {
                dispatch({ type: SagaActionTypes.ENHETCHANGED, data: nyEnhet });
            }
        }
    );

    const isInitialized = useSelector((state: State) => state.appdata.initialized);

    const apen: WrappedState<boolean> = useWrappedState(false);

    const ref = useRef(null);
    const outsideHandler = useCallback(() => apen.set(false), [apen]);
    useOnClickOutside(ref, outsideHandler);

    return (
        <DecoratorHotkeysProvider>
            <header className="dekorator" ref={ref}>
                <Banner apen={apen} appname={props.appname} hotkeys={props.hotkeys} />
                {isInitialized && <Lenker apen={apen} proxyConfig={props.useProxy || false} />}
                <Feilmelding />
                {isInitialized && <NyEnhetContextModal />}
                {isInitialized && <NyBrukerContextModal />}
            </header>
        </DecoratorHotkeysProvider>
    );
}

export let globalMutableApplicationConfig: Partial<ApplicationProps> = {};

class ErrorHandler extends React.Component<ApplicationProps> {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('CATCH', error, errorInfo);
    }

    render() {
        globalMutableApplicationConfig = this.props;
        return (
            <Provider store={store}>
                <Application {...this.props} />
            </Provider>
        );
    }
}

export default ErrorHandler;

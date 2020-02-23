import React, {useCallback, useRef} from 'react';
import {Dispatch} from 'redux';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store, {State} from './redux';
import {SagaActions, SagaActionTypes} from './redux/actions';
import {ApplicationProps} from './domain';
import Banner from './components/banner';
import Lenker from './components/lenker';
import NyEnhetContextModal from './components/modals/ny-enhet-context-modal';
import NyBrukerContextModal from './components/modals/ny-bruker-context-modal';
import Feilmelding from './components/feilmelding';
import {useWrappedState, WrappedState} from './hooks/use-wrapped-state';
import useOnClickOutside from './hooks/use-on-click-outside';
import {useOnMount} from './hooks/use-on-mount';

function Application(props: ApplicationProps) {
    const dispatch = useDispatch<Dispatch<SagaActions>>();
    useOnMount(() => {
        dispatch({type: SagaActionTypes.INIT, data: props});
    });
    const isInitialized = useSelector((state: State) => state.initialized);

    const apen: WrappedState<boolean> = useWrappedState(false);

    const ref = useRef(null);
    const outsideHandler = useCallback(() => apen.set(false), [apen]);
    useOnClickOutside(ref, outsideHandler);

    return (
        <div className="dekorator" ref={ref}>
            <Banner apen={apen} appname={props.appname}/>
            {isInitialized && <Lenker apen={apen}/>}
            {isInitialized && <Feilmelding/>}
            {isInitialized && <NyEnhetContextModal/>}
            {isInitialized && <NyBrukerContextModal/>}
        </div>
    );
}

class ErrorHandler extends React.Component<ApplicationProps> {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('CATCH', error, errorInfo);
    }

    render() {
        return (
            <Provider store={store}>
                <Application {...this.props} />
            </Provider>
        );
    }
}

export default ErrorHandler;
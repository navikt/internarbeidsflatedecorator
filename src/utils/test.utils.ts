interface TestWindow {
    location: unknown;
}
declare const window: TestWindow;
export function withLocation(host: string, assertion: () => void) {
    const original = window.location;
    delete window.location;
    window.location = { host } as any;
    assertion();
    window.location = original;
}

export const isMock: boolean = import.meta.env.MOCK === 'development' || !!import.meta.env.MOCK;

// import 'whatwg-fetch';
const setup = async () => {
    global.window = {
        location: {
            host: 'localhost',
            hostname: 'localhost'
        }
    };
    global.document = {
        URL: 'localhost'
    };
};

export default setup;

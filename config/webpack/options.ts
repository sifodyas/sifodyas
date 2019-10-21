import path from 'path';

const ROOT_APP_PATH = path.resolve(__dirname, '../../');
const DEV_SERVER = process.env.WEBPACK_MODE === 'watch';

const alias = {
    '@app': `${ROOT_APP_PATH}/src`,
    '@config': `${ROOT_APP_PATH}config`,
    '@npm': `${ROOT_APP_PATH}/node_modules`,
    '@output': `${ROOT_APP_PATH}/dist`,
    '@test': `${ROOT_APP_PATH}/test`,
    '@example': `${ROOT_APP_PATH}/example`,
    '@root': ROOT_APP_PATH,
};

import packageJson from '../../package.json';

export { ROOT_APP_PATH, DEV_SERVER, packageJson };
export default {
    alias,
};

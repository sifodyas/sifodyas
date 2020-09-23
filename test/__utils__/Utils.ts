import { resolve } from 'path';
import { Core } from '@sifodyas/sifodyas';

export const Utils = new (class TestUtils {
    get configRoot(): string {
        return resolve(Core.getBasePath(), 'test/__utils__/mocks/config/');
    }
})();

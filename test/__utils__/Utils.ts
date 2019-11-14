import { Core } from '@sifodyas/sifodyas';
import { resolve } from 'path';

export const Utils = new (class TestUtils {
    public get configRoot(): string {
        return resolve(Core.getBasePath(), 'test/__utils__/mocks/config/');
    }
})();

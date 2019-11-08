import { resolve } from 'path';
import { Core } from '../../src';

export const Utils = new (class TestUtils {
    public get configRoot(): string {
        return resolve(Core.getBasePath(), 'test/__utils__/mocks/config/');
    }
})();

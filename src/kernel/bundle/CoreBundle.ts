import { BundleClass as Bundle } from './Bundle';

/**
 * An implementation of IBundle via Bundle.
 *
 * Precise the core aspect of a Bundle.
 */
export abstract class CoreBundle extends Bundle {
    public isCore() {
        return true;
    }
}

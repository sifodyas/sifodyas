import crypto from 'crypto';
import { version } from '../../core/package.json';

if (typeof document !== 'undefined') {
    Object.defineProperty(document, 'currentScript', { value: { src: '' } });
    Object.defineProperty(window, 'crypto', {
        value: {
            getRandomValues(buffer: Uint8Array) {
                return crypto.randomFillSync(buffer);
            },
        },
    });
} else {
    global['window'] = void 0; // allocate window but keep it undefined
}

const G = typeof window !== 'undefined' ? window : global;
Object.defineProperty(G, 'VERSION', { value: `${version}-TEST` });
Object.defineProperty(G, 'VERSION_ID', { value: 0 });
Object.defineProperty(G, 'MAJOR_VERSION', { value: 0 });
Object.defineProperty(G, 'MINOR_VERSION', { value: 0 });
Object.defineProperty(G, 'RELEASE_VERSION', { value: 0 });
Object.defineProperty(G, 'EXTRA_VERSION', { value: 'TEST' });

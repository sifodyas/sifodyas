import { Trait } from '@bios21/tstrait';
import merge from 'lodash/merge';
import { Core } from '../core/Core';
import { ContainerError } from '../dependencyInjection';
import { Container } from '../dependencyInjection/Container';
import { InvalidArgumentException } from '../dependencyInjection/exception/InvalidArgumentException';
import { Reference } from '../dependencyInjection/Reference';
import { Expression } from '../expressionLanguage/Expression';
import { Loader } from './Loader';

interface ImportConfigObject {
    resource: string;
    ignore_errors?: boolean;
    type?: string;
}
/**
 * Trait for loaders that gives Json for output.
 */
export class JsonBasedLoaderTrait extends Trait {
    private isExternalResource(path: string): boolean {
        return /^https?:\/\//i.test(path);
    }

    /**
     * @async
     */
    public async parseImport(this: JsonBasedLoaderTrait & Loader, content: any, path: string): Promise<any> {
        if ('imports' in content) {
            if (!Core.isArray(content['imports'])) {
                throw new InvalidArgumentException(
                    `The "imports" key should contain an array in ${path}. Check your syntax.`,
                );
            }

            const baseDir = path.substring(0, path.lastIndexOf('/') + 1);
            const p = [];
            for (const imports of content['imports']) {
                if (!Core.isPureTypedObject<ImportConfigObject>(imports, { resource: '' })) {
                    throw new InvalidArgumentException(
                        // tslint:disable-next-line:max-line-length
                        `The values in the "imports" key should be key-valued (like {resource: string, ignore_errors?: boolean, type?: string}) in ${path}. Check your syntax.`,
                    );
                }

                if (this.isExternalResource(imports.resource)) {
                    if (!imports.type || !['yml', 'yaml', 'json'].includes(imports.type)) {
                        throw new InvalidArgumentException(
                            `The type of an external import must be "yml", "yaml", or "json" in ${path}. Check your syntax.`,
                        );
                    }

                    const resourceFile = await Core.getResource(imports.resource);
                    p.push(await this.import(resourceFile, imports.type, imports.ignore_errors));
                } else {
                    const resourceFile = await Core.getResource(baseDir + imports.resource);
                    p.push(await this.import(resourceFile, null, imports.ignore_errors));
                }
            }

            return Promise.all(p);
        }
    }

    /**
     * Loads json from content into container.
     *
     * @param content The content to load.
     * @param container The container onto load
     * @throws InvalidArgumentException If the parameters are not in an array.
     */
    public async loadJson(content: any, container: Container) {
        if ('parameters' in content) {
            if (!Core.isPureObject(content['parameters'])) {
                throw new InvalidArgumentException(
                    'The "parameters" key should contain an array in resource. Check your syntax.',
                );
            }

            for (const key in content['parameters']) {
                if (content['parameters'].hasOwnProperty(key)) {
                    let value = content['parameters'][key];
                    if (container.hasParameter(key)) {
                        const current = await container.getParameter(key);
                        if (Core.isPureObject(current) && Core.isPureObject(value)) {
                            value = merge(current, value);
                        }
                    }
                    container.setParameter(key, this.resolveServices(value));
                }
            }
        }
    }

    /**
     * Resolves services.
     */
    public resolveServices(value: any): any {
        if (Core.isArray<string>(value)) {
            value = value.map(v => this.resolveServices(v));
        } else if (Core.isString(value) && value.startsWith('@=')) {
            return new Expression(value.substr(2));
        } else if (Core.isString(value) && value.startsWith('@')) {
            let invalidBehavior: ContainerError = null;
            if (value.startsWith('@@')) {
                value = value.substr(1);
                invalidBehavior = null;
            } else if (value.startsWith('@?')) {
                value = value.substr(2);
                invalidBehavior = ContainerError.IGNORE_ON_INVALID_REFERENCE;
            } else {
                value = value.substr(1);
                invalidBehavior = ContainerError.EXCEPTION_ON_INVALID_REFERENCE;
            }

            let strict = true;
            if (value.substr(-1) === '=') {
                value = value.substr(0, -1);
                strict = false;
            }

            if (invalidBehavior !== null) {
                value = new Reference(value, invalidBehavior, strict);
            }
        }

        return value;
    }
}

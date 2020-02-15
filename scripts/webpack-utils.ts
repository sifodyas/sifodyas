import fs from 'fs';
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';

export const ROOT_WORKSPACE = path.resolve(__dirname, '..');
export const ROOT_APP_PATH = process.cwd();
export const WORKSPACE_PACKAGE_JSON = JSON.parse(
    fs.readFileSync(path.resolve(ROOT_WORKSPACE, 'package.json'), { encoding: 'utf-8' }),
);
export const APP_PACKAGE_JSON = JSON.parse(
    fs.readFileSync(path.resolve(ROOT_APP_PATH, 'package.json'), { encoding: 'utf-8' }),
);

/**
 * Return the list of all externals dependencies found in a package.json
 * (dependencies + devDependencies + associated resources files, like css)
 */
export function externals(pkgFolder?: string): string[] {
    let pkg = WORKSPACE_PACKAGE_JSON;
    if (pkgFolder?.startsWith('/')) {
        pkg = require(path.resolve(pkgFolder, 'package.json'));
    }

    const deps = [];
    const doer = (dep: string) => {
        deps.push(new RegExp(`^${dep}.*$`));
        deps.push(new RegExp(`^.*${dep}.*(.css)$`));
    };

    if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(doer);
    }

    if (pkg.devDependencies) {
        Object.keys(pkg.devDependencies).forEach(doer);
    }

    if (pkg.peerDependencies) {
        Object.keys(pkg.peerDependencies).forEach(doer);
    }

    return deps;
}

export const banner = `/*!\n${fs
    .readFileSync(path.resolve(ROOT_WORKSPACE, 'LICENSE'), { encoding: 'utf-8' })
    .split('\n')
    .map(line => ` * ${line}`)
    .join('\n')}\n */`;

export class DtsBanner implements webpack.Plugin {
    constructor(private outputFolder: string) {}
    public apply(compiler: webpack.Compiler) {
        compiler.hooks.done.tap('DtsBanner', () => {
            glob(path.resolve(this.outputFolder, '**/*.d.ts'), (_err, matches) => {
                for (const filePath of matches) {
                    fs.writeFileSync(filePath, `${banner}\n\n${fs.readFileSync(filePath, { encoding: 'utf-8' })}`, {
                        encoding: 'utf-8',
                    });
                }
            });
        });
    }
}

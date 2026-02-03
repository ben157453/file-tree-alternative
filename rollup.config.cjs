import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
// import million from 'million/compiler';
import { env } from 'process';
import fs from 'fs';
import path from 'path';

const isProd = (env.NODE_ENV || '').toLowerCase() === 'production';
const pkgJsonPath = path.resolve(process.cwd(), 'package.json');
let versionDir = '';
try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const v = pkg.version || '0.0.0';
    versionDir = `dist/${v}`;
} catch {
    versionDir = 'dist';
}

export default {
    context: 'window',
    input: 'src/main.ts',
    output: isProd
        ? [
              {
                  file: `${versionDir}/main.js`,
                  format: 'cjs',
                  exports: 'default',
                  sourcemap: false,
              },
              {
                  file: 'main.js',
                  format: 'cjs',
                  exports: 'default',
                  sourcemap: false,
              },
          ]
        : {
              file: 'main.js',
              format: 'cjs',
              exports: 'default',
              sourcemap: true,
          },
    external: ['obsidian', 'fs', 'os', 'path'],
    plugins: [
        typescript(),
        resolve({
            browser: true,
        }),
        replace({
            preventAssignment: false,
            'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        }),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
            compact: true,
        }),
        commonjs(),
        // million.rollup({ auto: true }),
    ],
};

import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import workspacesRun from 'workspaces-run';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';
// import { terser } from 'rollup-plugin-terser'

async function main() {
  const copyTargets = []
  const plugins = [
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    // terser(),
    copy({ targets: copyTargets })
  ];

  const results = [];
  const packages = [];

  await workspacesRun({ cwd: __dirname, orderByDeps: true }, async (pkg) => {
    if (!pkg.config.private) {
      packages.push(pkg);
    }
  });

  if (!process.env.TARGET) {
    console.log('Found following packages:')
    packages.forEach((pkg) => console.log('- ', pkg.name))
  } else {
    packages = packages.filter((pkg) => pkg.name === process.env.TARGET)
    if (!packages.length) throw new Error(`No package with name "${process.env.TARGET}". `)
  }

  packages.forEach((pkg) => {
    const {
      dependencies,
      peerDependencies,
      main,
      module,
      types,
    } = pkg.config

    const external = [
      ...Object.keys(dependencies || []),
      ...Object.keys(peerDependencies || [])
    ];

    const maybeDevtools = (str) => pkg.name == '@xoid/devtools' ? str.replace('index', 'devtools') : str

    const basePath = path.relative(__dirname, pkg.dir)
    const outputPath = basePath.replace('packages/', 'dist/');
    let input = path.join(basePath, maybeDevtools('src/index.tsx'));
    let copyPath = path.join(basePath, 'copy');
    const output = []

    if(fs.existsSync(copyPath)) {
      copyTargets.push({ src: `${copyPath}/*`, dest: outputPath })
    }
    ['package.json', 'README.md'].forEach((fileName) => {
      const packageConfigFile = path.join(basePath, fileName)
      if(fs.existsSync(packageConfigFile)) {
        copyTargets.push({ src: packageConfigFile, dest: outputPath })
      }  
    })
    if(pkg.name == 'xoid') {
      copyTargets.push({ src: 'README.md', dest: outputPath })
    }

    if(main) {
      output.push({
        file: path.join(outputPath, maybeDevtools(main)),
        format: 'cjs',
      })
    }
    
    if(module) {
      output.push({
        file: path.join(outputPath, maybeDevtools(module)),
        format: 'esm',
      })
    }

    results.push({
      input,
      output,
      external,
      plugins,
    });

    if(types) {
      results.push({
        input: path.join('dist/ts-out', basePath, maybeDevtools('src/index.d.ts')),
        output: { file: path.join(outputPath, 'index.d.ts'), format: 'es' },
        external,
        plugins: [dts({})],
      });
    }
  });
  return results;
}

export default main();

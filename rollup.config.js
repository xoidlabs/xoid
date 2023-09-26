import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import workspacesRun from 'workspaces-run';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';
// import terser from '@rollup/plugin-terser'

async function main() {
  const copyTargets = []
  const plugins = [
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    // terser({}),
    copy({ targets: copyTargets })
  ];

  const results = [];
  let packages = [];

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

    const basePath = path.relative(__dirname, pkg.dir)
    const outputPath = basePath.replace('packages/', 'dist/');
    let copyPath = path.join(basePath, 'copy');

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

    const entries = fs.readdirSync(path.join(pkg.dir, 'src'))
      .filter((file) => fs.lstatSync(path.join(pkg.dir, 'src', file)).isFile())

    entries.forEach((entry) => {
      const entryWithoutExtension = entry.replace('.tsx', '')
      const input = path.join(basePath, 'src', entry);
      const output = []

      if(main) {
        output.push({
          file: path.join(outputPath, entryWithoutExtension + '.js'),
          format: 'cjs',
        })
      }
      
      if(module) {
        output.push({
          file: path.join(outputPath, entryWithoutExtension + '.esm.js'),
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
          input: path.join('dist/ts-out', basePath, `src/${entryWithoutExtension}.d.ts`),
          output: { file: path.join(outputPath, `${entryWithoutExtension}.d.ts`), format: 'es' },
          external,
          plugins: [dts({})],
        });
      }
      
    })

  });
  return results;
}

export default main();

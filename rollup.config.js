import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import workspacesRun from 'workspaces-run';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser'

async function main() {
  const copyTargets = []
  const plugins = [
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    terser(),
    copy({ targets: copyTargets })
  ];

  const results = [];
  const packages = [];

  console.log('Found following packages:')
  await workspacesRun({ cwd: __dirname, orderByDeps: true }, async (pkg) => {
    if (!pkg.config.private) {
      console.log('- ', pkg.name)
      packages.push(pkg);
    }
  });

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
    let input = path.join(basePath, 'lib/index.tsx');
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
        file: path.join(outputPath, main),
        format: 'cjs',
      })
    }
    
    if(module) {
      output.push({
        file: path.join(outputPath, module),
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
      const typesInput = path.join('dist/ts-out', basePath, 'lib/index.d.ts');
      const typesOutput = []
      if(main) typesOutput.push({ file: path.join(outputPath, 'index.d.ts'), format: 'es' })
      if(module) typesOutput.push({ file: path.join(outputPath, 'esm/index.d.ts'), format: 'es' })

      results.push({
        input: typesInput,
        output: typesOutput,
        external,
        plugins: [dts()],
      });
    }
  });
  return results;
}

export default main();

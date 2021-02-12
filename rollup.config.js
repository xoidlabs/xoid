import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import workspacesRun from 'workspaces-run';
import copy from 'rollup-plugin-copy';

async function main() {
  const copyTargets = []
  const plugins = [
    typescript({
      useTsconfigDeclarationDir: true,
    }),
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
    const typesPath = path.join('dist/ts-out', basePath, 'lib/*');
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
      if(pkg.name !== 'xoid') {
        output.push({
          file: path.join(outputPath, main),
          format: 'cjs',
        })
      }
      if(types) {
        copyTargets.push({ src: typesPath, dest: outputPath })
      }
    }
    
    if(module) {
      output.push({
        file: path.join(outputPath, module),
        format: 'esm',
      })
      if(types) {
        copyTargets.push({ src: typesPath, dest: path.join(outputPath, 'esm') })
      }
    }

    if(pkg.name === '@xoid/model' || pkg.name === '@xoid/ready') {
      external.push('@xoid/core/utils')
    }

    if(pkg.name === '@xoid/core') {
      results.push({
        input: path.join(basePath, 'lib/utils.tsx'),
        output: [
          {
            file: path.join(outputPath, 'utils.js'),
            format: 'cjs',
          },
          {
            file: path.join(outputPath, 'esm/utils.js'),
            format: 'esm',
          },
        ],
        external,
        plugins,
      })
      results.push({
        input,
        output,
        external: ['@xoid/engine', './utils'],
        plugins,
      })
      return
    }

    results.push({
      input,
      output,
      external,
      plugins,
    });
  });
  return results;
}

export default main();

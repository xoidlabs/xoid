import path from 'path';
// import typescript from '@rollup/plugin-typescript';
import workspacesRun from 'workspaces-run';
import typescript from 'rollup-plugin-typescript2';

async function main() {
  const plugins = [
    typescript({
      declaration: true,
      emitDeclarationOnly: true,
      outDir: 'dist/typo',
    })
  ];

  const results = [];
  const packages = [];

  await workspacesRun({ cwd: __dirname, orderByDeps: true }, async (pkg) => {
    if (!pkg.config.private) {
      packages.push(pkg);
    }
  });

  packages.forEach((pkg) => {
    const external = [
      ...Object.keys(pkg.config.dependencies || []),
      ...Object.keys(pkg.config.peerDependencies || [])
    ];
    const basePath = path.relative(__dirname, pkg.dir);
    let input = path.join(basePath, 'lib/index.tsx');

    const output = []

    if(pkg.config.main) {
      output.push({
        file: path.join(basePath, pkg.config.main),
        format: 'cjs',
      })
    }
    
    if(pkg.config.module) {
      output.push({
        file: path.join(basePath, pkg.config.module),
        format: 'esm',
      })
    }

    results.push({
      input,
      output,
      external,
      plugins,
    });
  });

  console.log(results)
  return results;
}

export default main();

import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import workspacesRun from 'workspaces-run';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';

async function main() {
  const copyTargets = []
  const plugins = [
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    copy({ targets: copyTargets })
  ];

  const results = [];
  let packages = [];

  // Find all non-private packages in the workspace, ordered by dependencies
  await workspacesRun({ cwd: __dirname, orderByDeps: true }, async (pkg) => {
    if (!pkg.config.private) {
      packages.push(pkg);
    }
  });

  // Filter by TARGET environment variable if provided, otherwise list all packages
  if (!process.env.TARGET) {
    console.log('Found the following packages:')
    packages.forEach((pkg) => console.log('- ', pkg.name))
  } else {
    packages = packages.filter((pkg) => pkg.name === process.env.TARGET)
    if (!packages.length) throw new Error(`No package with name "${process.env.TARGET}". `)
  }

  // Generate Rollup configurations for each package
  packages.forEach((pkg) => {
    const basePath = path.relative(__dirname, pkg.dir)
    const outputPath = basePath.replace('packages/', 'dist/');
    let copyPath = path.join(basePath, 'copy');

    // Add "copy" directory contents to copy targets if it exists
    if(fs.existsSync(copyPath)) {
      copyTargets.push({ src: `${copyPath}/*`, dest: outputPath })
    }

    // Copy package.json and README.md (or root README if package-specific one is missing)
    ['package.json', 'README.md'].forEach((fileName) => {
      const file = path.join(basePath, fileName)
      if(fs.existsSync(file)) {
        copyTargets.push({ src: file, dest: outputPath })
      } else if (fileName === 'README.md') {
        copyTargets.push({ src: 'README.md', dest: outputPath })
      }
    })

    // Resolve exports from package.json or fallback to legacy main/module fields
    const configExports = pkg.config.exports || {'.': {
      types: pkg.config.types,
      module: pkg.config.module,
      default: pkg.config.main,
    }}

    const entries = Object.keys(configExports)

    entries.forEach((entry) => {
      // Define external dependencies to avoid bundling them
      const externalLookup = [
        ...Object.keys(pkg.config.dependencies || []),
        ...Object.keys(pkg.config.peerDependencies || []),
        ...entries.filter(s => s !== '.' || s !== entry)
      ];
      const external = (name) => externalLookup.includes(/^((?:\.\/)?(?:.*?))(?:\/|$)/.exec(name)[1])

      const entryOutputs = configExports[entry]
      if(entry === '.') entry = 'index'

      const input = path.join(basePath, 'src', entry + '.tsx');
      const output = []

      if(entryOutputs.default) {
        output.push({
          file: path.join(outputPath, entry + '.js'),
          format: 'cjs',
        })
      }
      
      if(entryOutputs.module) {
        output.push({
          file: path.join(outputPath, entry + '.esm.js'),
          format: 'esm',
        })
      }
      
      results.push({
        input,
        output,
        external,
        plugins,
      });

      if(entryOutputs.types) {
        results.push({
          input: path.join('dist/ts-out', basePath, `src/${entry}.d.ts`),
          output: { file: path.join(outputPath, `${entry}.d.ts`), format: 'es' },
          external,
          plugins: [dts({})],
        });
      }
      
    })

  });
  return results;
}

export default main();

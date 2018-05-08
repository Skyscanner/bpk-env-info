/* eslint no-console: 0 */

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const BACKPACK_PACKAGE_REGEX = /^(bpk-|react-native-bpk-)/;

const ls = async () => {
  const { stdout } = await exec('npm ls --json', { maxBuffer: 10 * 1024 * 1024 });

  return JSON.parse(stdout);
};

const determineBackpackReactScriptsVersion = (packages) => {
  const details = packages['backpack-react-scripts'];

  if (!details) {
    return null;
  }

  return details.version;
};

const topLevelBackpackPackages = packages => (
  Object
    .keys(packages)
    .filter(x => x.match(BACKPACK_PACKAGE_REGEX))
    .map(name => ({ name, version: packages[name].version }))
);

const determineNodeVersion = async () => {
  const { stdout } = await exec('node --version');

  return stdout.trim().replace(/^v/, '');
};

const determineNpmVersion = async () => {
  const { stdout } = await exec('npm --version');

  return stdout.trim();
};

(async () => {
  const packages = await ls();
  const nodeVersion = await determineNodeVersion();
  const npmVersion = await determineNpmVersion();
  const backpackReactScriptsVersion = determineBackpackReactScriptsVersion(packages.dependencies);
  const backpackPackages = topLevelBackpackPackages(packages.dependencies);

  console.log('Backpack environment info');
  console.log(`Node version: ${nodeVersion}`);
  console.log(`NPM version: ${npmVersion}`);
  console.log(`Backpack React Scripts used: ${backpackReactScriptsVersion !== null ? 'Yes' : 'No'}`);
  if (backpackReactScriptsVersion) {
    console.log(`Backpack React Scripts version: ${backpackReactScriptsVersion}`);
  }
  if (backpackPackages.length > 0) {
    console.log(`Backpack Packages:\n${backpackPackages.map(details => `${details.name}: ${details.version}`).join('\n')}`);
  }
})().catch((e) => {
  console.error(`Failed to get Backpack environment info: ${e}`); // eslint-disable-line no-console
  process.exit(1);
});

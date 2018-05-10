/* eslint no-console: 0 */
const chalk = require('chalk');
const semver = require('semver');

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const BACKPACK_PACKAGE_REGEX = /^(bpk-|react-native-bpk-)/;

const ls = async () => {
  const { stdout } = await exec('npm ls --json', { maxBuffer: 10 * 1024 * 1024 });

  return JSON.parse(stdout);
};

const outdated = async () => {
  // Note: We ignore the exit code here because if there is an
  // outdated package(likely) the exit code will be 1 this will in turn throw.
  const { stdout } = await exec('npm outdated --json || true', { maxBuffer: 10 * 1024 * 1024 });

  return JSON.parse(stdout);
};

const formatVersionInfo = (packageDetails, outdatedDetails) => {
  const isOutdated =
    packageDetails &&
    outdatedDetails &&
    semver.lt(packageDetails.version, outdatedDetails.latest);

  return `Current: ${chalk.blue(packageDetails.version)} ${outdatedDetails ? `Wanted: ${outdatedDetails.wanted} Latest: ${outdatedDetails.latest} ${isOutdated && chalk.red('[Outdated]')}` : ''}`;
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
  const oudatedPackages = await outdated();
  const nodeVersion = await determineNodeVersion();
  const npmVersion = await determineNpmVersion();
  const backpackReactScriptsVersion = determineBackpackReactScriptsVersion(packages.dependencies);
  const backpackPackages = topLevelBackpackPackages(packages.dependencies);

  console.log('Backpack environment info');
  console.log(`Node version: ${chalk.blue(nodeVersion)}`);
  console.log(`NPM version: ${chalk.blue(npmVersion)}`);
  console.log(`Backpack React Scripts used: ${backpackReactScriptsVersion !== null ? chalk.green('Yes') : chalk.red('No')}`);
  if (backpackReactScriptsVersion) {
    console.log(`Backpack React Scripts version: ${formatVersionInfo(packages.dependencies['backpack-react-scripts'], oudatedPackages['backpack-react-scripts'])}`);
  }
  if (backpackPackages.length > 0) {
    console.log(`\nTop level Backpack packages:\n${backpackPackages.map(details => `${details.name}: ${formatVersionInfo(details, oudatedPackages[details.name])}`).join('\n')}`);
  }
})().catch((e) => {
  console.error(`Failed to get Backpack environment info: ${e}`); // eslint-disable-line no-console
  process.exit(1);
});

/**
 * Generate a package of the app
 * 
 * @author Lenin Meza <merolhack@gmail.com>
 */

// Dependencies
const path = require('path');
const electronInstaller = require('electron-winstaller');

const src = path.join(__dirname, './dist/win/lenovoturns-win32-x64');
const out = path.join(__dirname, './dist/package');

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: src,
  outputDirectory: out,
  authors: 'merolhack@gmail.com',
  exe: 'lenovoturns.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
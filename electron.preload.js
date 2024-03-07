
console.log(`[preload.js] node version: ${process.versions.node}`);
console.log(`[preload.js] chrome version: ${process.versions.chrome}`);
console.log(`[preload.js] electron version: ${process.versions.electron}`);
console.log(`[preload.js] process.cwd(): ${process.cwd()}`);
console.log(`[preload.js] process.resourcesPath: ${process.resourcesPath}`);
console.log(`[preload.js] __dirname: ${__dirname}`);
console.log(`[preload.js] env.NODE_ENV: ${process.env.NODE_ENV}`);

const { ipcRenderer } = require('electron');
const os = require("os");
const fs = require("fs");
const path = require('path');

// 打印来自主进程的奔溃 dump 文件存放目录
ipcRenderer.on('crash-file-path', (event, args) => {
  console.warn('crash-file-path:', args);
});

// const {app} = require('electron');
window.ROOT_PATH =  path.join(__dirname, '../');
window.PUBLIC_PATH = path.join(__dirname);
window.path = path;
ipcRenderer.on('app-path', (event, appPath) => {
  console.warn('APP_PATH:', appPath);
  window.APP_PATH = appPath;
});

// 下面2两代码在生成 js 层帧数据 dump 时用到
window.homedir = os.homedir();
window.fs = fs;

// // crash test
// setTimeout(() => {
//   console.warn('---------------test crash');
//   process.crash();
// }, 10 * 1000);

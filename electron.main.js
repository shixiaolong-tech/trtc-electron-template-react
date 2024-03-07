const { app, BrowserWindow, crashReporter, ipcMain, systemPreferences } = require('electron');
const path = require('path');

if (app.isPackaged && process.platform === 'linux') {
  process.chdir(process.resourcesPath);
  process.chdir('..');
}

let crashFilePath = '';
let crashDumpsDir = '';
try {
  // electron 低版本
  crashFilePath = path.join(app.getPath('temp'), app.getName() + ' Crashes');
  console.log('————————crash path:', crashFilePath);

  // electron 高版本
  crashDumpsDir = app.getPath('crashDumps');
  console.log('————————crashDumpsDir:', crashDumpsDir);
} catch (e) {
  console.error('获取奔溃文件路径失败', e);
}

// 开启crash捕获
crashReporter.start({
  productName: 'trtc-electron-template-react',
  companyName: 'Tencent Cloud',
  submitURL: 'https://cloud.tencent.com',
  uploadToServer: false,
  ignoreSystemCrashHandler: false,
});

const preloadJS = path.join(__dirname, 'electron.preload.js');
console.warn('preload js', preloadJS);
let mainWindow = null;

async function checkAndApplyDevicePrivilege() {
  const cameraPrivilege = systemPreferences.getMediaAccessStatus('camera');

  if (cameraPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('camera');
  }

  const micPrivilege = systemPreferences.getMediaAccessStatus('microphone');

  if (micPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('microphone');
  }

  const screenPrivilege = systemPreferences.getMediaAccessStatus('screen');
  console.log(screenPrivilege);
}

async function createWindow () {
  if (process.platform === 'darwin' || process.platform === 'win32') {
    try {
      await checkAndApplyDevicePrivilege();
    } catch (err) {
      console.error('设备权限检查异常：', err);
    }
  }
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1366,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      preload: preloadJS,
    },
    allowRendererProcessReuse: true,
  });
  mainWindow.center();

  bindMainWindowEvent();

  if (app.isPackaged) {
    mainWindow.loadFile('build/index.html');
  } else {
    mainWindow.loadURL('http://localhost:3000/index.html');
  }
}

function bindMainWindowEvent() {
  let reloadID = 0;
  mainWindow.webContents.on('did-finish-load', function(event){
    mainWindow.webContents.send('crash-file-path', `${crashFilePath}|${crashDumpsDir}`);
    mainWindow.webContents.send('app-path', app.getAppPath());
  });
  // 在执行 npm run start 后，经常会窗口已经显示出来了，但代码还未构建好，此时捕获到 did-fail-load 事件，在之后延迟重载
  mainWindow.webContents.on('did-fail-load', function(event){
    if (reloadID) clearTimeout(reloadID);
    reloadID = setTimeout(()=>{
      mainWindow.reload();
      reloadID = null;
    },2000);
  });
}

app.whenReady().then(() => {
  // if (!app.isPackaged) {
  //   const {
  //     default: installExtension,
  //     REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS
  //   } = require('electron-devtools-installer');
  //   installExtension(REACT_DEVELOPER_TOOLS)
  //     .then(() => {
  //       return installExtension(REDUX_DEVTOOLS);
  //     }).then(() => {
  //     createWindow();
  //   })
  //     .catch((err) => {
  //       console.log('An error occurred: ', err);
  //       createWindow();
  //     });
  //   return;
  // }
  createWindow();
});

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当点击 dock 图标并且该应用没有打开的窗口时，
  // 绝大部分应用会重新创建一个窗口。
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-finish-launching', () => {
  console.log('app:will-finish-launching');
});

app.on('gpu-process-crashed', (event, kill) => {
  console.warn('app:gpu-process-crashed', event, kill);
});

app.on('renderer-process-crashed', (event, webContents, kill) => {
  console.warn('app:renderer-process-crashed', event, webContents, kill);
});

app.on('render-process-gone', (event, webContents, details) => {
  console.warn('app:render-process-gone', event, webContents, details);
});

app.on('child-process-gone', (event, details) => {
  console.warn('app:child-process-gone', event, details);
});

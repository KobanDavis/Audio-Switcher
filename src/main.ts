import { app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, Tray } from 'electron'
import path from 'path'
import cp from 'child_process'
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit()
}

const iconPath = path.join(app.getAppPath(), './resources/assets/switch.ico')
const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 400,
		height: 300,
		x: 16,
		y: 16,
		frame: false,
		show: false,
		resizable: false,
		fullscreenable: false,
		transparent: true,
		hasShadow: false,
		alwaysOnTop: true,
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
	return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const createTray = () => {
	const icon = nativeImage.createFromPath(iconPath)
	const tray = new Tray(icon)
	const menu = Menu.buildFromTemplate([{ label: 'Close', type: 'normal', click: () => app.exit() }])

	tray.setContextMenu(menu)
	tray.setToolTip('Audio Switcher')
}

app.on('ready', () => {
	const window = createWindow()
	createTray()

	window.on('blur', window.hide)

	ipcMain.handle('getAudioDevices', () => {
		const pwsh = path.resolve(app.getAppPath(), './resources/lib/AudioDevices.ps1')
		return new Promise((r) => {
			// const devices = cp.spawnSync('powershell.exe', [pwsh])
			// r(JSON.parse(new TextDecoder().decode(devices.stdout)))
			cp.exec(pwsh, { shell: 'powershell.exe' }, (_, stdout) => {
				r(JSON.parse(stdout))
			})
		})
	})

	ipcMain.handle('setAudioDevice', (_, id: string) => {
		const nircmd = path.resolve(app.getAppPath(), './resources/lib/nircmd.exe')
		return new Promise((r) => {
			cp.exec(`${nircmd} setdefaultsounddevice "${id}" 1`, r)
		})
	})

	ipcMain.handle('hide', (event) => {
		BrowserWindow.fromId(event.frameId)?.hide()
	})

	const show = () => {
		globalShortcut.unregister('Ctrl+D')
		if (window.isVisible() === false) {
			window.show()
		}
	}

	const registerShow = () => globalShortcut.register('Ctrl+D', show)

	window.on('hide', registerShow)
	registerShow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

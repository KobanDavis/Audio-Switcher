import { LoadingScreen, borderBase } from '@kobandavis/ui'
import { FC, useEffect, useState } from 'react'
import { AudioDevice } from 'types'
import clsx from 'clsx'

const { electronAPI } = window as any

const scrollToDevice = (deviceId: string) => {
	const el = document.getElementById(deviceId)
	if (!el) return
	const { top, bottom } = el.getBoundingClientRect()
	const inView = top >= 0 && bottom <= window.innerHeight
	if (inView === false) el.scrollIntoView({ behavior: 'smooth' })
}

const App: FC = () => {
	const [devices, setDevices] = useState<AudioDevice[]>(null)
	const [selectedDevice, setSelectedDevice] = useState<AudioDevice>(null)

	const getDevices = async () => {
		const allDevices: AudioDevice[] = await electronAPI.getAudioDevices()
		const devices = allDevices.filter((device) => device.DeviceState === 1)
		setDevices(devices)

		const defaultDevice = devices.toSorted((a, b) => a.LastUsed - b.LastUsed).pop()
		setSelectedDevice(defaultDevice)
	}

	const setAudioDevice = (device: AudioDevice) => {
		setSelectedDevice(device)
		electronAPI.setAudioDevice(device.SimpleName)
	}

	useEffect(() => {
		if (selectedDevice) {
			scrollToDevice(selectedDevice?.Id)
		}
	}, [selectedDevice])

	useEffect(() => {
		const keyUpHandler = (e: KeyboardEvent) => {
			if (e.key === 'Control') {
				electronAPI.hide()
				electronAPI.setAudioDevice(selectedDevice.SimpleName)
			}
		}

		const keyDownHandler = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === 'd') {
				const index = devices.findIndex((device) => device.Id === selectedDevice.Id)
				const nextIndex = e.shiftKey ? (index || devices.length) - 1 : (index + 1) % devices.length
				const nextDevice = devices[nextIndex]

				setSelectedDevice(nextDevice)
			}
		}

		window.addEventListener('keyup', keyUpHandler)
		window.addEventListener('keydown', keyDownHandler)
		return () => {
			window.removeEventListener('keyup', keyUpHandler)
			window.removeEventListener('keydown', keyDownHandler)
		}
	}, [selectedDevice])

	useEffect(() => {
		getDevices()
	}, [])

	return (
		<div className='bg-theme-secondary/50 text-theme-primary flex flex-col w-screen h-screen rounded overflow-auto'>
			<div className='flex flex-col'>
				{devices ? (
					devices.map((device) => {
						const label = device.SimpleName + (device.DescriptiveName ? ` (${device.DescriptiveName})` : '')
						return (
							<div
								title={label}
								key={device.Id}
								id={device.Id}
								onClick={() => setAudioDevice(device)}
								className={clsx(
									'py-2 px-4 border border-x-0 border-t-0 truncate cursor-pointer',
									borderBase,
									selectedDevice?.Id === device.Id && 'bg-theme-primary text-theme-secondary'
								)}
							>
								{label}
							</div>
						)
					})
				) : (
					<LoadingScreen />
				)}
			</div>
		</div>
	)
}

export default App

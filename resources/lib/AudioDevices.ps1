$path = "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Render"

$ids = Get-ChildItem -Path $path | Select-Object PSChildName
$devices = @()

foreach ($id in $ids) {
    $name = $id.PSChildName
    $descriptiveNameKey = '{b3f8fa53-0004-438e-9003-51a46e139bfc},6'
    $simpleNameKey = '{a45c254e-df1c-4efd-8020-67d146a850e0},2'
    $device = (Get-ItemProperty -Path "$path\\$name\\" | Select-Object -Property DeviceState, 'Level:0')
    $names = Get-ItemProperty -Path "$path\\$name\\Properties" | Select-Object -Property $descriptiveNameKey, $simpleNameKey
    $devices += @{
        DescriptiveName = $names.$descriptiveNameKey
        SimpleName      = $names.$simpleNameKey
        DeviceState     = $device.DeviceState
        LastUsed        = $device.'Level:0'
        Id              = $name
    }
}

ConvertTo-Json $devices | Write-Host
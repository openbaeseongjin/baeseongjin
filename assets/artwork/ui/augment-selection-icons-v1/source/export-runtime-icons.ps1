param(
    [string]$PackageRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$RuntimeDirectory = (Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PackageRoot))) "runtime\ui\augment-icons")
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$iconIds = @(
    "fast-launch", "long-rope", "fast-recover", "release-propulsion",
    "electrified-rope", "collision-explosion", "rope-regeneration", "double-jump",
    "energy-orb", "long-range-orb", "overcharged-orb", "ignition-orb", "arcane-slash",
    "meteor", "frost-burst", "shatter-bomb", "thermal-laser", "electric-orb",
    "mobility-surge", "low-gravity", "cooldown-reset", "freeze-bolt", "gathering-orb",
    "physics-dash", "chain-dash", "thruster-flight"
)

$exportDirectory = Join-Path $PackageRoot "export"
New-Item -ItemType Directory -Force -Path $RuntimeDirectory | Out-Null

foreach ($iconId in $iconIds) {
    $source = [System.Drawing.Image]::FromFile((Join-Path $exportDirectory "$iconId.png"))
    $output = New-Object System.Drawing.Bitmap 48, 48, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($output)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($source, 0, 0, 48, 48)
    $graphics.Dispose()
    $source.Dispose()
    $output.Save((Join-Path $RuntimeDirectory "$iconId.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $output.Dispose()
}

Write-Host "Exported $($iconIds.Count) antialiased 48x48 runtime icons to $RuntimeDirectory"

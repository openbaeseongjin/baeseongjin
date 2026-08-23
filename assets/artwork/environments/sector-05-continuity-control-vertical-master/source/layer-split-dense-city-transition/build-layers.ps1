param(
    [Parameter(Mandatory = $true)]
    [string]$MasterPath,

    [Parameter(Mandatory = $true)]
    [string]$FarInpaintPath,

    [Parameter(Mandatory = $true)]
    [string]$BoundaryPath,

    [Parameter(Mandatory = $true)]
    [string]$ExportDirectory,

    [Parameter(Mandatory = $true)]
    [string]$PreviewDirectory
)

Add-Type -AssemblyName System.Drawing

$definition = Get-Content -LiteralPath $BoundaryPath -Raw | ConvertFrom-Json
$width = [int]$definition.canvas.width
$height = [int]$definition.canvas.height

function New-SidePath {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Boundary,

        [Parameter(Mandatory = $true)]
        [bool]$IsMirrored
    )

    $points = New-Object System.Collections.Generic.List[System.Drawing.Point]
    $outerX = if ($IsMirrored) { $width } else { 0 }
    $points.Add((New-Object System.Drawing.Point($outerX, 0)))

    foreach ($point in $Boundary) {
        $pointX = if ($IsMirrored) { $width - [int]$point.x } else { [int]$point.x }
        $points.Add((New-Object System.Drawing.Point($pointX, [int]$point.y)))
    }

    $points.Add((New-Object System.Drawing.Point($outerX, $height)))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddPolygon($points.ToArray())
    return $path
}

function New-UnionRegion {
    param(
        [Parameter(Mandatory = $true)]
        [System.Drawing.Drawing2D.GraphicsPath]$LeftPath,

        [Parameter(Mandatory = $true)]
        [System.Drawing.Drawing2D.GraphicsPath]$RightPath
    )

    $region = New-Object System.Drawing.Region($LeftPath)
    $region.Union($RightPath)
    return $region
}

function New-Graphics {
    param(
        [Parameter(Mandatory = $true)]
        [System.Drawing.Bitmap]$Bitmap
    )

    $graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighSpeed
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    return $graphics
}

function Save-RegionMask {
    param(
        [Parameter(Mandatory = $true)]
        [System.Drawing.Region]$Region,

        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $bitmap = New-Object System.Drawing.Bitmap(
        $width,
        $height,
        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
        $graphics = New-Graphics -Bitmap $bitmap
        try {
            $graphics.Clear([System.Drawing.Color]::Transparent)
            $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
            try {
                $graphics.FillRegion($brush, $Region)
            } finally {
                $brush.Dispose()
            }
        } finally {
            $graphics.Dispose()
        }
        $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $bitmap.Dispose()
    }
}

function Save-Layer {
    param(
        [Parameter(Mandatory = $true)]
        [System.Drawing.Image]$Master,

        [Parameter(Mandatory = $true)]
        [System.Drawing.Region]$Region,

        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $bitmap = New-Object System.Drawing.Bitmap(
        $width,
        $height,
        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
        $graphics = New-Graphics -Bitmap $bitmap
        try {
            $graphics.Clear([System.Drawing.Color]::Transparent)
            $graphics.SetClip($Region, [System.Drawing.Drawing2D.CombineMode]::Replace)
            $graphics.DrawImageUnscaled($Master, 0, 0)
        } finally {
            $graphics.Dispose()
        }
        $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $bitmap.Dispose()
    }
}

function Save-Composite {
    param(
        [Parameter(Mandatory = $true)]
        [System.Drawing.Image]$Far,

        [Parameter(Mandatory = $true)]
        [System.Drawing.Image]$Mid,

        [Parameter(Mandatory = $true)]
        [System.Drawing.Image]$Near,

        [Parameter(Mandatory = $true)]
        [int]$MidOffsetX,

        [Parameter(Mandatory = $true)]
        [int]$NearOffsetX,

        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $bitmap = New-Object System.Drawing.Bitmap(
        $width,
        $height,
        [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
    )
    try {
        $graphics = New-Graphics -Bitmap $bitmap
        try {
            $graphics.DrawImageUnscaled($Far, 0, 0)
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
            $graphics.DrawImageUnscaled($Mid, $MidOffsetX, 0)
            $graphics.DrawImageUnscaled($Near, $NearOffsetX, 0)
        } finally {
            $graphics.Dispose()
        }
        $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $bitmap.Dispose()
    }
}

$master = [System.Drawing.Image]::FromFile($MasterPath)
$farInpaint = [System.Drawing.Image]::FromFile($FarInpaintPath)

try {
    if (
        $master.Width -ne $width -or
        $master.Height -ne $height -or
        $farInpaint.Width -ne $width -or
        $farInpaint.Height -ne $height
    ) {
        throw "Master, Far inpaint, and boundary canvas dimensions must match."
    }

    $leftTotalPath = New-SidePath -Boundary $definition.leftTotalSideInnerBoundary -IsMirrored $false
    $rightTotalPath = New-SidePath -Boundary $definition.leftTotalSideInnerBoundary -IsMirrored $true
    $leftNearPath = New-SidePath -Boundary $definition.leftNearInnerBoundary -IsMirrored $false
    $rightNearPath = New-SidePath -Boundary $definition.leftNearInnerBoundary -IsMirrored $true

    try {
        $totalSideRegion = New-UnionRegion -LeftPath $leftTotalPath -RightPath $rightTotalPath
        $nearRegion = New-UnionRegion -LeftPath $leftNearPath -RightPath $rightNearPath
        $midRegion = $totalSideRegion.Clone()
        $midRegion.Exclude($nearRegion)
        $farVisibleRegion = New-Object System.Drawing.Region(
            (New-Object System.Drawing.Rectangle(0, 0, $width, $height))
        )
        $farVisibleRegion.Exclude($totalSideRegion)

        try {
            $farPath = Join-Path $ExportDirectory "backdrop-far.png"
            $midPath = Join-Path $ExportDirectory "backdrop-mid.png"
            $nearPath = Join-Path $ExportDirectory "backdrop-near.png"

            $farBitmap = New-Object System.Drawing.Bitmap(
                $width,
                $height,
                [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
            )
            try {
                $graphics = New-Graphics -Bitmap $farBitmap
                try {
                    $graphics.DrawImageUnscaled($farInpaint, 0, 0)
                    $graphics.SetClip($farVisibleRegion, [System.Drawing.Drawing2D.CombineMode]::Replace)
                    $graphics.DrawImageUnscaled($master, 0, 0)
                } finally {
                    $graphics.Dispose()
                }
                $farBitmap.Save($farPath, [System.Drawing.Imaging.ImageFormat]::Png)
            } finally {
                $farBitmap.Dispose()
            }

            Save-Layer -Master $master -Region $midRegion -Path $midPath
            Save-Layer -Master $master -Region $nearRegion -Path $nearPath
            Save-RegionMask -Region $midRegion -Path (Join-Path $PSScriptRoot "mask-mid.png")
            Save-RegionMask -Region $nearRegion -Path (Join-Path $PSScriptRoot "mask-near.png")

            $depthMap = New-Object System.Drawing.Bitmap(
                $width,
                $height,
                [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
            )
            try {
                $graphics = New-Graphics -Bitmap $depthMap
                try {
                    $farValue = [int]$definition.depthValues.far
                    $midValue = [int]$definition.depthValues.mid
                    $nearValue = [int]$definition.depthValues.near
                    $graphics.Clear([System.Drawing.Color]::FromArgb($farValue, $farValue, $farValue))
                    $midBrush = New-Object System.Drawing.SolidBrush(
                        [System.Drawing.Color]::FromArgb($midValue, $midValue, $midValue)
                    )
                    $nearBrush = New-Object System.Drawing.SolidBrush(
                        [System.Drawing.Color]::FromArgb($nearValue, $nearValue, $nearValue)
                    )
                    try {
                        $graphics.FillRegion($midBrush, $midRegion)
                        $graphics.FillRegion($nearBrush, $nearRegion)
                    } finally {
                        $nearBrush.Dispose()
                        $midBrush.Dispose()
                    }
                } finally {
                    $graphics.Dispose()
                }
                $depthMap.Save((Join-Path $PSScriptRoot "depth-map.png"), [System.Drawing.Imaging.ImageFormat]::Png)
            } finally {
                $depthMap.Dispose()
            }

            $farLayer = [System.Drawing.Image]::FromFile($farPath)
            $midLayer = [System.Drawing.Image]::FromFile($midPath)
            $nearLayer = [System.Drawing.Image]::FromFile($nearPath)
            try {
                $midOffset = [int]$definition.parallaxPreview.midOffsetX
                $nearOffset = [int]$definition.parallaxPreview.nearOffsetX
                $neutralPath = Join-Path $PreviewDirectory "neutral-composite.png"
                $leftPath = Join-Path $PreviewDirectory "parallax-left.png"
                $rightPath = Join-Path $PreviewDirectory "parallax-right.png"
                Save-Composite -Far $farLayer -Mid $midLayer -Near $nearLayer -MidOffsetX 0 -NearOffsetX 0 -Path $neutralPath
                Save-Composite -Far $farLayer -Mid $midLayer -Near $nearLayer -MidOffsetX (-$midOffset) -NearOffsetX (-$nearOffset) -Path $leftPath
                Save-Composite -Far $farLayer -Mid $midLayer -Near $nearLayer -MidOffsetX $midOffset -NearOffsetX $nearOffset -Path $rightPath

                $neutral = [System.Drawing.Image]::FromFile($neutralPath)
                $leftPreview = [System.Drawing.Image]::FromFile($leftPath)
                $rightPreview = [System.Drawing.Image]::FromFile($rightPath)
                try {
                    $previewWidth = [int]($width / 2)
                    $previewHeight = [int]($height / 2)
                    $strip = New-Object System.Drawing.Bitmap(
                        ($previewWidth * 3),
                        $previewHeight,
                        [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
                    )
                    try {
                        $graphics = New-Graphics -Bitmap $strip
                        try {
                            $graphics.DrawImage($leftPreview, (New-Object System.Drawing.Rectangle(0, 0, $previewWidth, $previewHeight)))
                            $graphics.DrawImage($neutral, (New-Object System.Drawing.Rectangle($previewWidth, 0, $previewWidth, $previewHeight)))
                            $graphics.DrawImage($rightPreview, (New-Object System.Drawing.Rectangle(($previewWidth * 2), 0, $previewWidth, $previewHeight)))
                        } finally {
                            $graphics.Dispose()
                        }
                        $strip.Save((Join-Path $PreviewDirectory "parallax-preview-strip.png"), [System.Drawing.Imaging.ImageFormat]::Png)
                    } finally {
                        $strip.Dispose()
                    }
                } finally {
                    $rightPreview.Dispose()
                    $leftPreview.Dispose()
                    $neutral.Dispose()
                }
            } finally {
                $nearLayer.Dispose()
                $midLayer.Dispose()
                $farLayer.Dispose()
            }
        } finally {
            $farVisibleRegion.Dispose()
            $midRegion.Dispose()
            $nearRegion.Dispose()
            $totalSideRegion.Dispose()
        }
    } finally {
        $rightNearPath.Dispose()
        $leftNearPath.Dispose()
        $rightTotalPath.Dispose()
        $leftTotalPath.Dispose()
    }
} finally {
    $farInpaint.Dispose()
    $master.Dispose()
}

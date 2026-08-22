param(
    [string]$AssetRoot = (Split-Path -Parent $PSScriptRoot),
    [int]$FadeHeight = 512
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$references = @(
    [System.Drawing.Bitmap].Assembly.Location,
    [System.Drawing.Rectangle].Assembly.Location
) | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Leaf) } | Select-Object -Unique

$helperSource = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class RuntimeSeamLayers
{
    public static Bitmap FadeAlpha(Bitmap source, bool fadeTop, int fadeHeight)
    {
        if (fadeHeight < 2 || fadeHeight > source.Height)
            throw new ArgumentOutOfRangeException("fadeHeight");

        var output = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb);
        var rectangle = new Rectangle(0, 0, output.Width, output.Height);
        var sourceData = source.LockBits(rectangle, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        var data = output.LockBits(rectangle, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        try
        {
            int rowBytes = output.Width * 4;
            var row = new byte[rowBytes];
            for (int y = 0; y < output.Height; y++)
            {
                IntPtr sourcePointer = IntPtr.Add(sourceData.Scan0, y * sourceData.Stride);
                Marshal.Copy(sourcePointer, row, 0, rowBytes);

                int distanceFromEdge = fadeTop ? y : output.Height - 1 - y;
                if (distanceFromEdge < fadeHeight)
                {
                    double t = distanceFromEdge / (double)(fadeHeight - 1);
                    double smooth = t * t * (3.0 - 2.0 * t);
                    double stepped = Math.Round(smooth * 16.0) / 16.0;
                    for (int x = 3; x < rowBytes; x += 4)
                        row[x] = (byte)Math.Round(row[x] * stepped);
                }

                IntPtr outputPointer = IntPtr.Add(data.Scan0, y * data.Stride);
                Marshal.Copy(row, 0, outputPointer, rowBytes);
            }
        }
        finally
        {
            output.UnlockBits(data);
            source.UnlockBits(sourceData);
        }
        return output;
    }

    public static Bitmap BlendBottomToTop(Bitmap source, Bitmap targetTop, int blendHeight)
    {
        if (source.Width != targetTop.Width || blendHeight < 2 ||
            blendHeight > source.Height || blendHeight > targetTop.Height)
            throw new ArgumentException("Invalid far-layer bridge inputs.");

        var output = new Bitmap(source.Width, source.Height, PixelFormat.Format24bppRgb);
        using (var graphics = Graphics.FromImage(output))
        {
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.DrawImageUnscaled(source, 0, 0);
        }

        var outputData = output.LockBits(
            new Rectangle(0, 0, output.Width, output.Height),
            ImageLockMode.ReadWrite,
            PixelFormat.Format24bppRgb
        );
        var targetData = targetTop.LockBits(
            new Rectangle(0, 0, targetTop.Width, targetTop.Height),
            ImageLockMode.ReadOnly,
            PixelFormat.Format24bppRgb
        );
        try
        {
            int rowBytes = output.Width * 3;
            var outputRow = new byte[rowBytes];
            var targetRow = new byte[rowBytes];
            for (int distance = 0; distance < blendHeight; distance++)
            {
                int outputY = output.Height - 1 - distance;
                double t = distance / (double)(blendHeight - 1);
                double smooth = t * t * (3.0 - 2.0 * t);
                double targetWeight = Math.Round((1.0 - smooth) * 16.0) / 16.0;
                if (targetWeight <= 0.0) continue;

                IntPtr outputPointer = IntPtr.Add(outputData.Scan0, outputY * outputData.Stride);
                IntPtr targetPointer = IntPtr.Add(targetData.Scan0, distance * targetData.Stride);
                Marshal.Copy(outputPointer, outputRow, 0, rowBytes);
                Marshal.Copy(targetPointer, targetRow, 0, rowBytes);
                for (int x = 0; x < rowBytes; x++)
                {
                    outputRow[x] = (byte)Math.Round(
                        outputRow[x] * (1.0 - targetWeight) + targetRow[x] * targetWeight
                    );
                }
                Marshal.Copy(outputRow, 0, outputPointer, rowBytes);
            }
        }
        finally
        {
            targetTop.UnlockBits(targetData);
            output.UnlockBits(outputData);
        }
        return output;
    }

    public static Bitmap Composite(Bitmap far, Bitmap mid, Bitmap near)
    {
        if (far.Width != mid.Width || far.Width != near.Width ||
            far.Height != mid.Height || far.Height != near.Height)
            throw new ArgumentException("Layer sizes must match.");

        var output = new Bitmap(far.Width, far.Height, PixelFormat.Format24bppRgb);
        using (var graphics = Graphics.FromImage(output))
        {
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.DrawImageUnscaled(far, 0, 0);
            graphics.CompositingMode = CompositingMode.SourceOver;
            graphics.DrawImageUnscaled(mid, 0, 0);
            graphics.DrawImageUnscaled(near, 0, 0);
        }
        return output;
    }

    public static Bitmap BoundaryPreview(Bitmap sector02, Bitmap sector01, int halfHeight)
    {
        if (sector01.Width != sector02.Width || halfHeight <= 0 ||
            halfHeight > sector01.Height || halfHeight > sector02.Height)
            throw new ArgumentException("Invalid boundary preview inputs.");

        var output = new Bitmap(sector01.Width, halfHeight * 2, PixelFormat.Format24bppRgb);
        using (var graphics = Graphics.FromImage(output))
        {
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.DrawImage(
                sector02,
                new Rectangle(0, 0, sector02.Width, halfHeight),
                new Rectangle(0, sector02.Height - halfHeight, sector02.Width, halfHeight),
                GraphicsUnit.Pixel
            );
            graphics.DrawImage(
                sector01,
                new Rectangle(0, halfHeight, sector01.Width, halfHeight),
                new Rectangle(0, 0, sector01.Width, halfHeight),
                GraphicsUnit.Pixel
            );
        }
        return output;
    }
}
'@

Add-Type -TypeDefinition $helperSource -ReferencedAssemblies $references

$sectors = @(
    @{ Id = 'sector-01-maintenance'; FadeTop = $true },
    @{ Id = 'sector-02-worker-district'; FadeTop = $false }
)

$loaded = @{}

try {
    foreach ($sector in $sectors) {
        $id = $sector.Id
        $sourceDirectory = Join-Path $AssetRoot 'source\references'
        $exportDirectory = Join-Path $AssetRoot "export\$id"
        $farPath = Join-Path $sourceDirectory "$id-backdrop-far.png"
        $midPath = Join-Path $sourceDirectory "$id-backdrop-mid.png"
        $nearPath = Join-Path $sourceDirectory "$id-backdrop-near.png"

        foreach ($path in @($farPath, $midPath, $nearPath)) {
            if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
                throw "Missing source layer: $path"
            }
        }

        Copy-Item -LiteralPath $farPath -Destination (Join-Path $exportDirectory 'backdrop-far.png') -Force

        $far = [System.Drawing.Bitmap]::FromFile($farPath)
        $midSource = [System.Drawing.Bitmap]::FromFile($midPath)
        $nearSource = [System.Drawing.Bitmap]::FromFile($nearPath)
        $mid = [RuntimeSeamLayers]::FadeAlpha($midSource, $sector.FadeTop, $FadeHeight)
        $near = [RuntimeSeamLayers]::FadeAlpha($nearSource, $sector.FadeTop, $FadeHeight)

        $mid.Save((Join-Path $exportDirectory 'backdrop-mid.png'), [System.Drawing.Imaging.ImageFormat]::Png)
        $near.Save((Join-Path $exportDirectory 'backdrop-near.png'), [System.Drawing.Imaging.ImageFormat]::Png)

        $loaded[$id] = @{
            Far = $far
            MidSource = $midSource
            NearSource = $nearSource
            Mid = $mid
            Near = $near
        }
    }

    $sector02FarTransition = [RuntimeSeamLayers]::BlendBottomToTop(
        $loaded['sector-02-worker-district'].Far,
        $loaded['sector-01-maintenance'].Far,
        $FadeHeight
    )
    $loaded['sector-02-worker-district'].FarTransition = $sector02FarTransition
    $sector02FarTransition.Save(
        (Join-Path $AssetRoot 'export\sector-02-worker-district\backdrop-far.png'),
        [System.Drawing.Imaging.ImageFormat]::Png
    )

    $original01 = [RuntimeSeamLayers]::Composite(
        $loaded['sector-01-maintenance'].Far,
        $loaded['sector-01-maintenance'].MidSource,
        $loaded['sector-01-maintenance'].NearSource
    )
    $original02 = [RuntimeSeamLayers]::Composite(
        $loaded['sector-02-worker-district'].Far,
        $loaded['sector-02-worker-district'].MidSource,
        $loaded['sector-02-worker-district'].NearSource
    )
    $candidate01 = [RuntimeSeamLayers]::Composite(
        $loaded['sector-01-maintenance'].Far,
        $loaded['sector-01-maintenance'].Mid,
        $loaded['sector-01-maintenance'].Near
    )
    $candidate02 = [RuntimeSeamLayers]::Composite(
        $loaded['sector-02-worker-district'].FarTransition,
        $loaded['sector-02-worker-district'].Mid,
        $loaded['sector-02-worker-district'].Near
    )

    try {
        $originalPreview = [RuntimeSeamLayers]::BoundaryPreview($original02, $original01, 720)
        $candidatePreview = [RuntimeSeamLayers]::BoundaryPreview($candidate02, $candidate01, 720)
        try {
            $originalPreview.Save(
                (Join-Path $AssetRoot 'preview\boundary-original.png'),
                [System.Drawing.Imaging.ImageFormat]::Png
            )
            $candidatePreview.Save(
                (Join-Path $AssetRoot 'preview\boundary-faded-structure-v1.png'),
                [System.Drawing.Imaging.ImageFormat]::Png
            )
        }
        finally {
            $candidatePreview.Dispose()
            $originalPreview.Dispose()
        }
    }
    finally {
        $candidate02.Dispose()
        $candidate01.Dispose()
        $original02.Dispose()
        $original01.Dispose()
    }

    Write-Output "Fade height: $FadeHeight"
    Write-Output "Candidate: $(Join-Path $AssetRoot 'preview\boundary-faded-structure-v1.png')"
}
finally {
    foreach ($entry in $loaded.Values) {
        foreach ($bitmap in $entry.Values) {
            if ($bitmap) { $bitmap.Dispose() }
        }
    }
}

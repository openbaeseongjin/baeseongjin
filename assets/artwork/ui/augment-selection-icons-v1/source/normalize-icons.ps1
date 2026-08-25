param(
    [string]$PackageRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies @("System.Drawing.Common", "System.Drawing.Primitives", "System.Private.Windows.GdiPlus", "System.Private.Windows.Core") -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class AugmentIconNormalizer
{
    private static byte[] ReadPixels(Bitmap bitmap, out BitmapData data)
    {
        Rectangle bounds = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
        data = bitmap.LockBits(bounds, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        byte[] pixels = new byte[Math.Abs(data.Stride) * bitmap.Height];
        Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
        return pixels;
    }

    private static bool IsLightNeutral(byte b, byte g, byte r)
    {
        int max = Math.Max(r, Math.Max(g, b));
        int min = Math.Min(r, Math.Min(g, b));
        return r >= 225 && g >= 225 && b >= 225 && max - min <= 24;
    }

    private static void RemoveConnectedLightBackground(Bitmap bitmap)
    {
        BitmapData data;
        byte[] pixels = ReadPixels(bitmap, out data);
        int width = bitmap.Width;
        int height = bitmap.Height;
        int stride = Math.Abs(data.Stride);
        int count = width * height;
        bool hasTransparency = false;

        for (int y = 0; y < height && !hasTransparency; y++)
        {
            int row = y * stride;
            for (int x = 0; x < width; x++)
            {
                if (pixels[row + x * 4 + 3] < 250)
                {
                    hasTransparency = true;
                    break;
                }
            }
        }

        if (!hasTransparency)
        {
            bool[] background = new bool[count];
            int[] queue = new int[count];
            int head = 0;
            int tail = 0;

            Action<int, int> seed = (x, y) =>
            {
                int index = y * width + x;
                if (background[index]) return;
                int offset = y * stride + x * 4;
                if (!IsLightNeutral(pixels[offset], pixels[offset + 1], pixels[offset + 2])) return;
                background[index] = true;
                queue[tail++] = index;
            };

            for (int x = 0; x < width; x++)
            {
                seed(x, 0);
                seed(x, height - 1);
            }
            for (int y = 1; y < height - 1; y++)
            {
                seed(0, y);
                seed(width - 1, y);
            }

            while (head < tail)
            {
                int index = queue[head++];
                int x = index % width;
                int y = index / width;
                int[] neighbors = { index - 1, index + 1, index - width, index + width };
                int start = x == 0 ? 1 : 0;
                int end = x == width - 1 ? 1 : 2;

                if (x > 0)
                {
                    int next = neighbors[0];
                    if (!background[next])
                    {
                        int offset = y * stride + (x - 1) * 4;
                        if (IsLightNeutral(pixels[offset], pixels[offset + 1], pixels[offset + 2]))
                        {
                            background[next] = true;
                            queue[tail++] = next;
                        }
                    }
                }
                if (x + 1 < width)
                {
                    int next = neighbors[1];
                    if (!background[next])
                    {
                        int offset = y * stride + (x + 1) * 4;
                        if (IsLightNeutral(pixels[offset], pixels[offset + 1], pixels[offset + 2]))
                        {
                            background[next] = true;
                            queue[tail++] = next;
                        }
                    }
                }
                if (y > 0)
                {
                    int next = neighbors[2];
                    if (!background[next])
                    {
                        int offset = (y - 1) * stride + x * 4;
                        if (IsLightNeutral(pixels[offset], pixels[offset + 1], pixels[offset + 2]))
                        {
                            background[next] = true;
                            queue[tail++] = next;
                        }
                    }
                }
                if (y + 1 < height)
                {
                    int next = neighbors[3];
                    if (!background[next])
                    {
                        int offset = (y + 1) * stride + x * 4;
                        if (IsLightNeutral(pixels[offset], pixels[offset + 1], pixels[offset + 2]))
                        {
                            background[next] = true;
                            queue[tail++] = next;
                        }
                    }
                }
            }

            for (int index = 0; index < count; index++)
            {
                if (!background[index]) continue;
                int x = index % width;
                int y = index / width;
                int offset = y * stride + x * 4;
                pixels[offset] = 0;
                pixels[offset + 1] = 0;
                pixels[offset + 2] = 0;
                pixels[offset + 3] = 0;
            }
        }

        Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
        bitmap.UnlockBits(data);
    }

    private static Rectangle FindContentBounds(Bitmap bitmap)
    {
        BitmapData data;
        byte[] pixels = ReadPixels(bitmap, out data);
        int stride = Math.Abs(data.Stride);
        int minX = bitmap.Width;
        int minY = bitmap.Height;
        int maxX = -1;
        int maxY = -1;

        for (int y = 0; y < bitmap.Height; y++)
        {
            int row = y * stride;
            for (int x = 0; x < bitmap.Width; x++)
            {
                if (pixels[row + x * 4 + 3] <= 12) continue;
                minX = Math.Min(minX, x);
                minY = Math.Min(minY, y);
                maxX = Math.Max(maxX, x);
                maxY = Math.Max(maxY, y);
            }
        }

        bitmap.UnlockBits(data);
        if (maxX < minX || maxY < minY) return new Rectangle(0, 0, bitmap.Width, bitmap.Height);
        int padding = Math.Max(2, Math.Min(bitmap.Width, bitmap.Height) / 80);
        minX = Math.Max(0, minX - padding);
        minY = Math.Max(0, minY - padding);
        maxX = Math.Min(bitmap.Width - 1, maxX + padding);
        maxY = Math.Min(bitmap.Height - 1, maxY + padding);
        return Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
    }

    private static void ClearTransparentRgb(Bitmap bitmap)
    {
        BitmapData data;
        byte[] pixels = ReadPixels(bitmap, out data);
        int stride = Math.Abs(data.Stride);
        for (int y = 0; y < bitmap.Height; y++)
        {
            int row = y * stride;
            for (int x = 0; x < bitmap.Width; x++)
            {
                int offset = row + x * 4;
                if (pixels[offset + 3] != 0) continue;
                pixels[offset] = 0;
                pixels[offset + 1] = 0;
                pixels[offset + 2] = 0;
            }
        }
        Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
        bitmap.UnlockBits(data);
    }

    public static void Normalize(string sourcePath, string outputPath, int size)
    {
        using (Bitmap loaded = new Bitmap(sourcePath))
        using (Bitmap source = new Bitmap(loaded.Width, loaded.Height, PixelFormat.Format32bppArgb))
        {
            using (Graphics sourceGraphics = Graphics.FromImage(source))
            {
                sourceGraphics.CompositingMode = CompositingMode.SourceCopy;
                sourceGraphics.DrawImageUnscaled(loaded, 0, 0);
            }

            RemoveConnectedLightBackground(source);
            Rectangle crop = FindContentBounds(source);
            using (Bitmap output = new Bitmap(size, size, PixelFormat.Format32bppArgb))
            using (Graphics graphics = Graphics.FromImage(output))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceOver;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                int inset = 4;
                float scale = Math.Min((float)(size - inset * 2) / crop.Width, (float)(size - inset * 2) / crop.Height);
                int drawWidth = Math.Max(1, (int)Math.Round(crop.Width * scale));
                int drawHeight = Math.Max(1, (int)Math.Round(crop.Height * scale));
                int drawX = (size - drawWidth) / 2;
                int drawY = (size - drawHeight) / 2;
                graphics.DrawImage(source, new Rectangle(drawX, drawY, drawWidth, drawHeight), crop, GraphicsUnit.Pixel);
                ClearTransparentRgb(output);
                output.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
'@

$iconIds = @(
    "fast-launch", "long-rope", "fast-recover", "release-propulsion",
    "electrified-rope", "collision-explosion", "rope-regeneration", "double-jump",
    "long-range-orb", "overcharged-orb", "ignition-orb", "arcane-slash",
    "meteor", "frost-burst", "shatter-bomb", "thermal-laser",
    "electric-orb", "mobility-surge", "low-gravity", "cooldown-reset",
    "freeze-bolt", "gathering-orb", "chain-dash", "thruster-flight"
)

$sourceDir = Join-Path $PackageRoot "source"
$exportDir = Join-Path $PackageRoot "export"
$previewDir = Join-Path $PackageRoot "preview"
New-Item -ItemType Directory -Force -Path $exportDir, $previewDir | Out-Null

foreach ($iconId in $iconIds) {
    $sourcePath = Join-Path $sourceDir "$iconId-imagegen.png"
    $outputPath = Join-Path $exportDir "$iconId.png"
    [AugmentIconNormalizer]::Normalize($sourcePath, $outputPath, 96)
}

function Export-DerivedStarterIcon {
    param(
        [string]$SourceId,
        [string]$TargetId,
        [System.Drawing.Rectangle]$SourceBounds
    )

    $source = [System.Drawing.Image]::FromFile((Join-Path $exportDir "$SourceId.png"))
    $output = New-Object System.Drawing.Bitmap 96, 96, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($output)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle 6, 6, 84, 84), $SourceBounds, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()
    $source.Dispose()
    $output.Save((Join-Path $exportDir "$TargetId.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $output.Dispose()
}

Export-DerivedStarterIcon -SourceId "long-range-orb" -TargetId "energy-orb" -SourceBounds (New-Object System.Drawing.Rectangle 0, 18, 58, 60)
Export-DerivedStarterIcon -SourceId "chain-dash" -TargetId "physics-dash" -SourceBounds (New-Object System.Drawing.Rectangle 0, 18, 52, 60)

$atlas = New-Object System.Drawing.Bitmap 576, 384, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$atlasGraphics = [System.Drawing.Graphics]::FromImage($atlas)
$atlasGraphics.Clear([System.Drawing.Color]::Transparent)
for ($index = 0; $index -lt $iconIds.Count; $index++) {
    $icon = [System.Drawing.Image]::FromFile((Join-Path $exportDir "$($iconIds[$index]).png"))
    $atlasGraphics.DrawImageUnscaled($icon, ($index % 6) * 96, ([math]::Floor($index / 6)) * 96)
    $icon.Dispose()
}
$atlasGraphics.Dispose()
$atlas.Save((Join-Path $exportDir "augment-selection-icons-v1.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$atlas.Dispose()

$preview = New-Object System.Drawing.Bitmap 576, 384, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$previewGraphics = [System.Drawing.Graphics]::FromImage($preview)
$previewGraphics.Clear([System.Drawing.Color]::FromArgb(255, 7, 18, 31))
$atlasImage = [System.Drawing.Image]::FromFile((Join-Path $exportDir "augment-selection-icons-v1.png"))
$previewGraphics.DrawImageUnscaled($atlasImage, 0, 0)
$atlasImage.Dispose()
$previewGraphics.Dispose()
$preview.Save((Join-Path $previewDir "augment-selection-icons-v1-review.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$preview.Dispose()

Write-Host "Generated 24 selection icons, 2 derived starter icons, a 576x384 atlas, and a same-size dark review sheet."

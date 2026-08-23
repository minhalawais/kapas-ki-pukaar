"""Generate responsive Kapas ki Pukaar assets from the approved logo mark.

The compact mark is used in product chrome and platform icons. The English
lockup is generated deterministically for launch, social, and large-format
placements. Product headings remain live text so they stay localized.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "brand"
SOURCE_MARK = OUT / "logo-mark-v2.png"

CREAM = (247, 243, 232, 255)
DEEP_GREEN = (11, 93, 59, 255)
TEAL = (45, 148, 128, 255)
TRANSPARENT = (0, 0, 0, 0)


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def save_webp(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="WEBP", lossless=True, method=6)


def trim_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha_box = rgba.getchannel("A").getbbox()
    if alpha_box is None:
        raise ValueError(f"Brand source has no visible pixels: {SOURCE_MARK}")
    return rgba.crop(alpha_box)


def fit(
    artwork: Image.Image,
    canvas_size: tuple[int, int],
    max_size: tuple[int, int],
    background: tuple[int, int, int, int] = TRANSPARENT,
) -> Image.Image:
    canvas = Image.new("RGBA", canvas_size, background)
    fitted = artwork.copy()
    fitted.thumbnail(max_size, Image.Resampling.LANCZOS)
    x = (canvas_size[0] - fitted.width) // 2
    y = (canvas_size[1] - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))
    return canvas


def find_inter_font(weight: str) -> Path:
    matches = sorted(
        ROOT.glob(
            f"node_modules/.pnpm/@expo-google-fonts+inter@*/node_modules/"
            f"@expo-google-fonts/inter/{weight}/Inter_{weight}.ttf"
        )
    )
    if not matches:
        raise FileNotFoundError(
            "Inter font assets are missing. Run pnpm install before generating brand assets."
        )
    return matches[-1]


def tracked_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, tracking: int) -> int:
    widths = [draw.textlength(character, font=font) for character in text]
    return round(sum(widths) + tracking * max(0, len(text) - 1))


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    origin: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    tracking: int,
) -> None:
    x, y = origin
    for character in text:
        draw.text((round(x), y), character, font=font, fill=fill)
        x += draw.textlength(character, font=font) + tracking


def make_vertical_lockup(mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (1200, 1400), TRANSPARENT)
    canvas.alpha_composite(fit(mark, (820, 820), (760, 760)), (190, 40))

    draw = ImageDraw.Draw(canvas)
    primary = ImageFont.truetype(str(find_inter_font("800ExtraBold")), 190)
    secondary = ImageFont.truetype(str(find_inter_font("600SemiBold")), 80)
    primary_text = "KAPAS"
    secondary_text = "KI PUKAAR"
    primary_width = tracked_width(draw, primary_text, primary, 4)
    secondary_width = tracked_width(draw, secondary_text, secondary, 18)
    draw_tracked(draw, ((1200 - primary_width) // 2, 845), primary_text, primary, DEEP_GREEN, 4)
    draw_tracked(draw, ((1200 - secondary_width) // 2, 1070), secondary_text, secondary, TEAL, 18)
    return trim_alpha(canvas)


def make_horizontal_lockup(mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (1800, 560), TRANSPARENT)
    canvas.alpha_composite(fit(mark, (500, 500), (440, 440)), (20, 30))

    draw = ImageDraw.Draw(canvas)
    primary = ImageFont.truetype(str(find_inter_font("800ExtraBold")), 175)
    secondary = ImageFont.truetype(str(find_inter_font("600SemiBold")), 67)
    draw_tracked(draw, (555, 90), "KAPAS", primary, DEEP_GREEN, 3)
    draw_tracked(draw, (562, 310), "KI PUKAAR", secondary, TEAL, 15)
    return trim_alpha(canvas)


def make_monochrome_foreground(mark: Image.Image) -> Image.Image:
    red, green, blue, source_alpha = mark.split()
    min_channel = ImageChops.darker(ImageChops.darker(red, green), blue)
    color_strength = ImageOps.invert(min_channel).point(
        lambda value: 0 if value < 80 else min(255, round((value - 80) * 1.7))
    )
    structural_alpha = ImageChops.multiply(color_strength, source_alpha)
    structural_alpha = structural_alpha.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    structural_mark = Image.new("RGBA", mark.size, (255, 255, 255, 0))
    structural_mark.putalpha(structural_alpha)
    return fit(structural_mark, (1024, 1024), (548, 548))


def copy_asset(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    print(f"wrote {destination.relative_to(ROOT)}")


def main() -> None:
    if not SOURCE_MARK.exists():
        raise FileNotFoundError(f"Approved logo master is missing: {SOURCE_MARK}")

    source = Image.open(SOURCE_MARK).convert("RGBA")
    if source.getchannel("A").getextrema()[0] == 255:
        raise ValueError("Approved logo master must have a transparent background")

    mark = trim_alpha(source)
    vertical_lockup = make_vertical_lockup(mark)
    horizontal_lockup = make_horizontal_lockup(mark)

    save_png(fit(mark, (1024, 1024), (920, 920)), OUT / "logo-mark.png")
    for size in (512, 256, 160, 80, 40, 32):
        target = round(size * 0.9)
        save_png(fit(mark, (size, size), (target, target)), OUT / f"logo-mark-{size}.png")
    save_webp(fit(mark, (512, 512), (460, 460)), OUT / "logo-mark.webp")

    save_png(vertical_lockup, OUT / "logo-lockup-vertical.png")
    save_png(vertical_lockup, OUT / "logo-lockup.png")
    save_png(horizontal_lockup, OUT / "logo-lockup-horizontal.png")
    save_webp(horizontal_lockup, OUT / "logo-lockup-horizontal.webp")

    save_png(fit(mark, (1024, 1024), (720, 720), CREAM), OUT / "icon-1024.png")
    save_png(fit(mark, (512, 512), (360, 360), CREAM), OUT / "icon-512.png")
    save_png(fit(mark, (192, 192), (136, 136), CREAM), OUT / "icon-192.png")
    save_png(fit(mark, (180, 180), (128, 128), CREAM), OUT / "apple-icon-180.png")
    save_png(fit(mark, (1024, 1024), (548, 548)), OUT / "adaptive-foreground.png")
    save_png(make_monochrome_foreground(mark), OUT / "monochrome-foreground.png")

    splash = fit(vertical_lockup, (1024, 1024), (490, 710), CREAM)
    save_png(splash, OUT / "splash-lockup.png")
    save_png(splash, OUT / "splash-icon.png")

    for size in (16, 32, 48):
        target = round(size * 0.78)
        save_png(fit(mark, (size, size), (target, target), CREAM), OUT / f"favicon-{size}.png")
    favicon_ico_source = Image.open(OUT / "favicon-48.png").convert("RGBA")
    favicon_ico_source.save(OUT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    save_png(fit(horizontal_lockup, (1200, 630), (940, 330), CREAM), OUT / "social-card-1200x630.png")

    copies: list[tuple[Path, Path]] = [
        (OUT / "logo-mark.png", ROOT / "apps/mobile/assets/logo-mark.png"),
        (OUT / "logo-lockup-vertical.png", ROOT / "apps/mobile/assets/logo-lockup.png"),
        (OUT / "icon-1024.png", ROOT / "apps/mobile/assets/icon.png"),
        (OUT / "adaptive-foreground.png", ROOT / "apps/mobile/assets/adaptive-icon.png"),
        (OUT / "monochrome-foreground.png", ROOT / "apps/mobile/assets/monochrome-icon.png"),
        (OUT / "splash-lockup.png", ROOT / "apps/mobile/assets/splash-icon.png"),
        (OUT / "favicon-48.png", ROOT / "apps/mobile/assets/favicon.png"),
        (OUT / "logo-mark-256.png", ROOT / "apps/puwf-portal/public/brand/logo-mark.png"),
        (OUT / "logo-mark.webp", ROOT / "apps/puwf-portal/public/brand/logo-mark.webp"),
        (OUT / "logo-lockup-horizontal.png", ROOT / "apps/puwf-portal/public/brand/logo-lockup.png"),
        (OUT / "logo-lockup-horizontal.webp", ROOT / "apps/puwf-portal/public/brand/logo-lockup.webp"),
        (OUT / "social-card-1200x630.png", ROOT / "apps/puwf-portal/public/brand/social-card.png"),
        (OUT / "icon-512.png", ROOT / "apps/puwf-portal/src/app/icon.png"),
        (OUT / "apple-icon-180.png", ROOT / "apps/puwf-portal/src/app/apple-icon.png"),
        (OUT / "social-card-1200x630.png", ROOT / "apps/puwf-portal/src/app/opengraph-image.png"),
        (OUT / "social-card-1200x630.png", ROOT / "apps/puwf-portal/src/app/twitter-image.png"),
        (OUT / "favicon-32.png", ROOT / "apps/puwf-portal/public/favicon.png"),
        (OUT / "favicon.ico", ROOT / "apps/puwf-portal/public/favicon.ico"),
    ]
    for source_path, destination in copies:
        copy_asset(source_path, destination)

    print(f"mark source {source.size}; trimmed {mark.size}")
    print(f"vertical lockup {vertical_lockup.size}; horizontal lockup {horizontal_lockup.size}")


if __name__ == "__main__":
    main()

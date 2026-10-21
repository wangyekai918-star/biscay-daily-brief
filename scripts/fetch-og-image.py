#!/usr/bin/env python3
"""Save a source page's Open Graph image as a square news thumbnail."""

import io
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

from PIL import Image, ImageOps


class PreviewImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.image = None

    def handle_starttag(self, tag, attrs):
        if tag != "meta" or self.image:
            return
        values = dict(attrs)
        if values.get("property") == "og:image" or values.get("name") == "twitter:image":
            self.image = values.get("content")


def fetch(url):
    return subprocess.check_output(
        ["curl", "-fLsS", "--max-time", "25", "-A", "Mozilla/5.0", url]
    )


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: fetch-og-image.py SOURCE_URL OUTPUT.jpg")
    source, output = sys.argv[1:]
    parser = PreviewImageParser()
    parser.feed(fetch(source).decode("utf-8", errors="replace"))
    if not parser.image:
        raise SystemExit(f"No Open Graph image: {source}")
    image_url = urljoin(source, parser.image)
    with Image.open(io.BytesIO(fetch(image_url))) as original:
        image = ImageOps.fit(ImageOps.exif_transpose(original).convert("RGB"), (512, 512), method=Image.Resampling.LANCZOS)
        Path(output).parent.mkdir(parents=True, exist_ok=True)
        image.save(output, "JPEG", quality=84, optimize=True)
    print(f"{output} <- {image_url}")


if __name__ == "__main__":
    main()

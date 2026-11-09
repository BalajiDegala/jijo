"""Optional: regenerate PWA PNGs from the original vector icon using PyMuPDF."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path('.tools/python')))
import pymupdf

destination = Path('public/icons')
destination.mkdir(exist_ok=True)
source = Path('public/icon.svg').read_text(encoding='utf-8')
square = source.replace('rx="116"', 'rx="0"')
for filename, size, svg in [
    ('icon-192.png', 192, source),
    ('icon-512.png', 512, source),
    ('apple-touch-icon.png', 180, square),
    ('maskable-512.png', 512, square),
]:
    vector = pymupdf.open('svg', svg.encode('utf-8'))
    document = pymupdf.open('pdf', vector.convert_to_pdf())
    page = document[0]
    page.get_pixmap(matrix=pymupdf.Matrix(size / page.rect.width, size / page.rect.height), alpha=False).save(str(destination / filename))
    print(f'{filename}: {size} x {size}')

#!/usr/bin/env python3
"""
Generate PNG icons from SVG for browser extensions.
This script creates simple placeholder icons if no SVG renderer is available.
"""

from pathlib import Path
import struct

def create_simple_png(width, height, color_rgb=(59, 130, 246)):
    """Create a simple PNG with a solid color"""
    def png_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = 0xffffffff
        for byte in chunk:
            crc ^= byte
            for _ in range(8):
                if crc & 1:
                    crc = (crc >> 1) ^ 0xedb88320
                else:
                    crc >>= 1
        crc ^= 0xffffffff
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', crc)
    
    png_signature = b'\x89PNG\r\n\x1a\n'
    
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_chunk = png_chunk(b'IHDR', ihdr_data)
    
    raw_data = b''
    for _ in range(height):
        raw_data += b'\x00'
        raw_data += (bytes(color_rgb) * width)
    
    import zlib
    compressed = zlib.compress(raw_data, 9)
    idat_chunk = png_chunk(b'IDAT', compressed)
    
    iend_chunk = png_chunk(b'IEND', b'')
    
    return png_signature + ihdr_chunk + idat_chunk + iend_chunk

def generate_icons(output_dir, sizes=[16, 32, 48, 128]):
    """Generate icon files in different sizes"""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for size in sizes:
        icon_path = output_dir / f'icon-{size}.png'
        png_data = create_simple_png(size, size)
        icon_path.write_bytes(png_data)
        print(f'Generated {icon_path}')

if __name__ == '__main__':
    chrome_icons = Path(__file__).parent.parent / 'extensions' / 'chrome' / 'icons'
    firefox_icons = Path(__file__).parent.parent / 'extensions' / 'firefox' / 'icons'
    
    print('Generating Chrome icons...')
    generate_icons(chrome_icons)
    
    print('Generating Firefox icons...')
    generate_icons(firefox_icons)
    
    print('Done!')

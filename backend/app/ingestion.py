import io
import re
from dataclasses import dataclass
from pathlib import Path
from docx import Document
from pypdf import PdfReader


@dataclass
class PageText:
    page: int | None
    text: str


def parse_document(filename: str, content: bytes) -> list[PageText]:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(io.BytesIO(content))
        return [PageText(index + 1, page.extract_text() or "") for index, page in enumerate(reader.pages)]
    if suffix == ".docx":
        document = Document(io.BytesIO(content))
        return [PageText(None, "\n".join(p.text for p in document.paragraphs))]
    if suffix in {".txt", ".md", ".markdown"}:
        return [PageText(None, content.decode("utf-8", errors="replace"))]
    raise ValueError("Supported file types: PDF, DOCX, Markdown, and TXT")


def chunk_pages(pages: list[PageText], size: int = 1200, overlap: int = 180) -> list[PageText]:
    chunks: list[PageText] = []
    for page in pages:
        text = re.sub(r"\s+", " ", page.text).strip()
        start = 0
        while start < len(text):
            end = min(start + size, len(text))
            if end < len(text):
                boundary = text.rfind(" ", start, end)
                end = boundary if boundary > start + size // 2 else end
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(PageText(page.page, chunk))
            if end >= len(text):
                break
            start = max(end - overlap, start + 1)
    return chunks

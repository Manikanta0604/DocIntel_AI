from app.ingestion import PageText, chunk_pages, parse_document


def test_parse_text_document():
    pages = parse_document("notes.txt", b"A grounded answer needs evidence.")
    assert pages[0].text.startswith("A grounded")


def test_chunking_retains_page_metadata():
    chunks = chunk_pages([PageText(3, "word " * 700)], size=200, overlap=20)
    assert len(chunks) > 1
    assert all(chunk.page == 3 for chunk in chunks)

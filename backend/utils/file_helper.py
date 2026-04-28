import fitz  # PyMuPDF
import docx2txt
import os

def extract_text_from_file(file_path: str) -> str:
    """
    파일 확장자에 따라 적절한 텍스트 추출 함수를 호출합니다.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.pdf':
        return _extract_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        return _extract_from_docx(file_path)
    elif ext == '.txt':
        # ✅ 텍스트 파일 처리 추가
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"지원하지 않는 파일 형식입니다: {ext}")

def _extract_from_pdf(file_path: str) -> str:
    """PDF 파일에서 텍스트 추출"""
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

def _extract_from_docx(file_path: str) -> str:
    """DOCX 파일에서 텍스트 추출"""
    return docx2txt.process(file_path)
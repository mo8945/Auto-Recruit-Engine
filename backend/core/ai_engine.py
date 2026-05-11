# core/ai_engine.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser # StrOutputParser 추가
import os

class AIEngine:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0
        )
        self.json_parser = JsonOutputParser()
        self.str_parser = StrOutputParser() # 문자열 파서 추가

    def get_completion(self, context: str, prompt_template: str):
        """JSON 데이터 추출용 (키워드 분석 등)"""
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | self.llm | self.json_parser
        return chain.invoke({"context": context})

    def get_text_completion(self, context: str, prompt_template: str):
        """[중요] 일반 텍스트 추출용 (심층 인사이트 요약용)"""
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | self.llm | self.str_parser
        return chain.invoke({"context": context})

    def analyze_resume(self, text: str):
        from prompts.resume_prompts import RESUME_ANALYSIS_PROMPT
        return self.get_completion(text, RESUME_ANALYSIS_PROMPT)
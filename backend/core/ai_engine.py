from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import os

class AIEngine:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0
        )
        self.parser = JsonOutputParser()

    def get_completion(self, context: str, prompt_template: str):
        """
        텍스트(context)와 프롬프트 템플릿을 받아 AI 분석 결과를 반환합니다.
        """
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | self.llm | self.parser
        
        return chain.invoke({"context": context})

    def analyze_resume(self, text: str):
        """이력서 분석 전용 (기존 코드와 호환성 유지)"""
        from prompts.resume_prompts import RESUME_ANALYSIS_PROMPT
        return self.get_completion(text, RESUME_ANALYSIS_PROMPT)
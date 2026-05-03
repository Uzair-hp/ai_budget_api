import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Using gemini-1.5-flash for better speed and higher free-tier rate limits
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def categorize_transaction(description: str):
    """Sends a transaction description to the Gemini API and returns a clean category."""
    
    # We define categories clearly for the AI
    categories = "Food, Transportation, Entertainment, Utilities, Healthcare, Shopping, Income, Investment, Other"
    
    prompt = f"""
    Categorize this bank transaction into ONE of these categories: {categories}.
    
    Description: {description}
    
    Return ONLY the category name.
    """
    
    try:
        response = model.generate_content(prompt)
        category = response.text.strip()
        
        # Validate that the AI returned one of our allowed strings
        valid_categories = {cat.strip() for cat in categories.split(",")}
        
        if category in valid_categories:
            return category
        return 'Other'
    except Exception as e:
        print(f"AI Error: {e}")
        return 'Uncategorized'

def chat_with_finances(user_query: str, context_data: str):
    """
    Answers user questions based on their financial data context.
    """
    prompt = f"""
    You are a personal financial assistant. Use the following user data to answer their question.
    
    Data Context:
    {context_data}
    
    User Question: {user_query}
    
    Provide a helpful, concise, and professional response.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"I'm sorry, I couldn't process that: {str(e)}"

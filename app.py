import streamlit as st
import pandas as pd
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

@st.cache_data()
def load_data():
    return pd.read_csv('bookData.csv')

@st.cache_data()
def load_tfidf_matrix():
    df = load_data()
    df['Tags'] = df['Tags'].fillna('')
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform(df['Tags'])
    return tfidf_matrix

def format_author_name(author):
    if not isinstance(author, str) or pd.isna(author):
        return "Unknown Author"
    return author.strip().replace(',', '')

def get_content_recommendations(title, df, tfidf_matrix):
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    idx = df.index[df['Title'] == title].tolist()[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:4]  # Get top 3 matches, excluding the book itself
    book_indices = [i[0] for i in sim_scores]
    recommendations = df.iloc[book_indices]
    return recommendations, [sim[1] for sim in sim_scores]

def main():
    st.title('Book Recommendation System')
    
    df = load_data()
    tfidf_matrix = load_tfidf_matrix()
    
    # Add a placeholder at the beginning of the book list
    book_list = ["Choose an option"] + df['Title'].tolist()
    selected_book = st.selectbox("Search Books in the Health & Wellness Database", book_list)
    
    # Check if a book was selected before proceeding
    if selected_book != "Choose an option":
        if st.button('Get Recommendations'):
            recommendations, similarities = get_content_recommendations(selected_book, df, tfidf_matrix)
            
            st.write("Based on this book, here are the top 3 most closely related recommendations:")
            
            for i, (index, row) in enumerate(recommendations.iterrows()):
                similarity_percentage = similarities[i] * 100
                author_info = format_author_name(row['Author']) if 'Author' in df.columns else ""
                cover_url = row['URL']  # Directly use the URL from the 'URL' column
                
                st.image(cover_url, width=100)
                st.write(f"{i+1}: **{row['Title']}** by {author_info} ({similarity_percentage:.2f}% similar)")

if __name__ == '__main__':
    main()

"""
Student Hub — SGPA (Study Guide & Personal Assistant) Streamlit UI
"""
import streamlit as st
from academic.sgpa_engine import SGPAStudyEngine

def render_sgpa_ui():
    """Renders the SGPA Academic Study Suite in Streamlit."""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 1.8rem; border-radius: 16px; color: white; margin-bottom: 1.5rem;">
        <h1 style="color: white; margin: 0; font-size: 2rem;">📘 SGPA — Study Guide & Personal Assistant</h1>
        <p style="color: #e0e7ff; margin: 0.5rem 0 0 0; font-size: 1.05rem;">
            AI-powered academic study buddy: concept explainer, quiz generator, exam solver, and answer evaluator.
        </p>
    </div>
    """, unsafe_allow_html=True)

    engine = SGPAStudyEngine()

    tab_explainer, tab_quizzer, tab_solver, tab_evaluator, tab_summarizer = st.tabs([
        "🧠 Concept Explainer",
        "📝 Quiz Generator",
        "📖 Exam Solver",
        "✅ Answer Evaluator",
        "📄 Exam Summarizer"
    ])

    with tab_explainer:
        st.subheader("Explain Academic Concepts")
        st.caption("Get intuitive definitions, real-world analogies, step-by-step breakdowns, and key exam takeaways.")
        
        col1, col2 = st.columns([3, 1])
        with col1:
            concept_input = st.text_input("Concept or Topic", placeholder="e.g., Deadlock Handling in Operating Systems, Normalization in DBMS, Dijkstra's Algorithm")
        with col2:
            include_visuals = st.checkbox("Include Visuals / Diagrams", value=True)
            academic_level = st.selectbox("Academic Level", ["Undergraduate", "Postgraduate", "High School", "Beginner"])
            
        if st.button("🚀 Explain Concept", type="primary", key="btn_explain"):
            if concept_input.strip():
                with st.spinner("Generating conceptual explanation..."):
                    result = engine.explain_concept(concept_input, include_visuals=include_visuals, academic_level=academic_level)
                    st.markdown(result["response"])
            else:
                st.warning("Please enter a concept or topic.")

    with tab_quizzer:
        st.subheader("AI Quiz Generator")
        st.caption("Generate multi-format questions (MCQ, True/False, Fill-in, Analytical) with separated answer keys.")
        
        quiz_topic = st.text_area("Notes or Topic for Quiz", placeholder="Paste your study notes, a textbook passage, or list key topics here...", height=120)
        col_q1, col_q2 = st.columns(2)
        with col_q1:
            num_q = st.slider("Number of Questions", min_value=3, max_value=15, value=5)
        with col_q2:
            st.write("")
            st.write("")
            quiz_vis = st.checkbox("Include Difficulty Matrix", value=True, key="quiz_matrix")
            
        if st.button("📝 Generate Quiz", type="primary", key="btn_gen_quiz"):
            if quiz_topic.strip():
                with st.spinner("Crafting quiz questions & answer key..."):
                    result = engine.generate_quiz(quiz_topic, num_questions=num_q, include_visuals=quiz_vis)
                    st.markdown(result["response"])
            else:
                st.warning("Please provide a topic or passage.")

    with tab_solver:
        st.subheader("Exam Question Solver")
        st.caption("Get exam-ready answers customized to word limits and mark allocations.")
        
        solve_input = st.text_area("Questions to Solve", placeholder="Paste your assignment or exam questions here...", height=120)
        col_s1, col_s2 = st.columns(2)
        with col_s1:
            word_limit = st.select_slider("Target Word Limit per Answer", options=[40, 80, 120, 200, 300], value=120)
        with col_s2:
            marks_type = st.selectbox("Marks Category", ["Short Answer (2-3 Marks)", "Long Answer (5-10 Marks)", "Objective / 1 Mark"])
            
        if st.button("✍️ Solve Questions", type="primary", key="btn_solve_q"):
            if solve_input.strip():
                with st.spinner("Solving questions with exam-optimized formatting..."):
                    result = engine.solve_questions(solve_input, word_limit=word_limit, marks_category=marks_type)
                    st.markdown(result["response"])
            else:
                st.warning("Please paste at least one question.")

    with tab_evaluator:
        st.subheader("Answer Evaluator & Grader")
        st.caption("Submit exam questions and your answers to receive scoring, critique, and improvement recommendations.")
        
        eval_q = st.text_area("Question(s)", placeholder="Enter the original question(s)...", height=80)
        eval_a = st.text_area("Your Answer(s)", placeholder="Type or paste your written answers here...", height=120)
        
        if st.button("🔍 Evaluate My Answers", type="primary", key="btn_eval_a"):
            if eval_q.strip() and eval_a.strip():
                with st.spinner("Evaluating accuracy, completeness, and grading answers..."):
                    result = engine.evaluate_answers(eval_q, eval_a)
                    st.markdown(result["response"])
            else:
                st.warning("Please enter both the questions and your answers.")

    with tab_summarizer:
        st.subheader("Exam-Oriented Summarizer")
        st.caption("Condense study material with key axioms, formulas, and active recall practice.")
        
        sum_text = st.text_area("Study Material / Notes", placeholder="Paste lecture notes or chapter text...", height=140)
        sum_focus = st.text_input("Special Focus (Optional)", placeholder="e.g., Focus on numerical formulas, or focus on architectural differences")
        
        if st.button("📑 Generate Exam Brief", type="primary", key="btn_exam_sum"):
            if sum_text.strip():
                with st.spinner("Compiling high-yield exam summary..."):
                    result = engine.exam_summarize(sum_text, user_focus=sum_focus)
                    st.markdown(result["response"])
            else:
                st.warning("Please paste study material.")

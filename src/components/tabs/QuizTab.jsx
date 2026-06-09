import { usePrep } from "../../context/PrepContext.jsx";

export default function QuizTab({ active }) {
  const {
    activeQuizId,
    activeQuiz,
    quizIndex,
    quizScore,
    quizAnswered,
    quizChosen,
    quizFinished,
    currentQuestion,
    quizCategories,
    startQuiz,
    handleQuizBack,
    handleQuizAnswer,
    handleQuizNext,
    handleQuizRetry,
  } = usePrep();

  const showCategories = !activeQuizId;
  const showArea = !!activeQuizId;

  return (
    <section id="tab-quiz" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Practice tests</h2>
        <p>No negative marking — attempt all in the real exam.</p>
      </div>

      <div id="quiz-categories" className={showCategories ? "" : "hidden"}>
        {quizCategories.map((cat) => (
          <div
            key={cat.id}
            className="quiz-cat"
            data-quiz={cat.id}
            onClick={() => startQuiz(cat.id)}
            onKeyDown={(e) => e.key === "Enter" && startQuiz(cat.id)}
            role="button"
            tabIndex={0}
          >
            <span>{cat.title}</span>
            <span className="muted">{cat.count} Q · +10 XP each</span>
          </div>
        ))}
      </div>

      <div id="quiz-area" className={showArea ? "" : "hidden"}>
        <div
          className="quiz-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <button id="quiz-back" type="button" className="btn ghost" onClick={handleQuizBack}>
            ← Back
          </button>
          <span id="quiz-progress" className="small muted">
            {!quizFinished && activeQuiz
              ? `${quizIndex + 1} / ${activeQuiz.questions.length}`
              : ""}
          </span>
        </div>

        {!quizFinished && currentQuestion && (
          <>
            <div id="quiz-question" className="card">
              {currentQuestion.q}
            </div>
            <div id="quiz-options">
              {currentQuestion.opts.map((o, i) => {
                let cls = "quiz-option";
                if (quizAnswered) {
                  if (i === currentQuestion.a) cls += " correct";
                  if (i === quizChosen && quizChosen !== currentQuestion.a) cls += " wrong";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className={cls}
                    data-i={i}
                    disabled={quizAnswered}
                    onClick={() => handleQuizAnswer(i)}
                  >
                    {String.fromCharCode(65 + i)}. {o}
                  </button>
                );
              })}
            </div>
            <button
              id="quiz-next"
              type="button"
              className={`btn primary full${quizAnswered ? "" : " hidden"}`}
              onClick={handleQuizNext}
            >
              Next
            </button>
          </>
        )}

        {quizFinished && activeQuiz && (
          <div id="quiz-result" className="card result-card">
            <div className="result-score">
              {quizScore}/{activeQuiz.questions.length}
            </div>
            <p>
              {Math.round((quizScore / activeQuiz.questions.length) * 100)}% —{" "}
              {Math.round((quizScore / activeQuiz.questions.length) * 100) >= 70
                ? "Great! 🎉"
                : "Revise and retry"}
            </p>
            <button type="button" className="btn primary" id="retry-quiz" onClick={handleQuizRetry}>
              Try again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

namespace QuizzApp.DTOs
{
    // Represents a single answer when submitting a quiz
    public class AnswerDTO
    {
        public int QuestionId { get; set; }

        public int SelectedOptionId { get; set; }
    }

    public class SubmitQuizDTO
    {
        public int QuizId { get; set; }

        public List<AnswerDTO> Answers { get; set; } = new List<AnswerDTO>();
    }

    public class QuizResultDTO
    {
        public int ResultId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public double Percentage { get; set; }
        public DateTime CompletedAt { get; set; }

        public List<AnswerResultDTO> AnswerBreakdown { get; set; } = new List<AnswerResultDTO>();
    }

    public class AnswerResultDTO
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int SelectedOptionId { get; set; }
        public string SelectedOptionText { get; set; } = string.Empty;
        public int CorrectOptionId { get; set; }
        public string CorrectOptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}

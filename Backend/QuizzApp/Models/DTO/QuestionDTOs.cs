namespace QuizzApp.DTOs
{
    public class CreateOptionDTO
    {
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;
    }

    public class CreateQuestionDTO
    {
        public int QuizId { get; set; }
        public string QuestionText { get; set; } = string.Empty;

        // Each question should have at least 2 options
        public List<CreateOptionDTO> Options { get; set; } = new List<CreateOptionDTO>();
    }

    public class QuestionDTO
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public List<OptionDTO> Options { get; set; } = new List<OptionDTO>();
    }

    public class OptionDTO
    {
        public int Id { get; set; }
        public string OptionText { get; set; } = string.Empty;

        // Only included in responses for QuizCreators (not shown during quiz taking)
        public bool IsCorrect { get; set; }
    }
}

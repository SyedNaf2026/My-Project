namespace QuizzApp.DTOs
{
    // Used when creating a new quiz
    public class CreateQuizDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }

        // Optional time limit in minutes (null = no limit)
        public int? TimeLimit { get; set; }
    }

    // Used when updating an existing quiz
    public class UpdateQuizDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public int? TimeLimit { get; set; }
        public bool IsActive { get; set; }
    }

    // Returned when listing quizzes
    public class QuizDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int? TimeLimit { get; set; }
        public bool IsActive { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TotalQuestions { get; set; }
    }
}

using Microsoft.EntityFrameworkCore;
using QuizzApp.Context;
using QuizzApp.DTOs;
using QuizzApp.Interfaces;
using QuizzApp.Models;

namespace QuizzApp.Services
{
    // QuizAttemptService handles quiz taking, answer submission, and automatic scoring
    public class QuizAttemptService : IQuizAttemptService
    {
        private readonly IGenericRepository<Quiz> _quizRepo;
        private readonly IGenericRepository<QuizResult> _resultRepo;
        private readonly IGenericRepository<UserAnswer> _answerRepo;
        private readonly AppDbContext _context;

        public QuizAttemptService(
            IGenericRepository<Quiz> quizRepo,
            IGenericRepository<QuizResult> resultRepo,
            IGenericRepository<UserAnswer> answerRepo,
            AppDbContext context)
        {
            _quizRepo = quizRepo;
            _resultRepo = resultRepo;
            _answerRepo = answerRepo;
            _context = context;
        }

        public async Task<(bool Success, string Message, QuizResultDTO? Data)> SubmitQuizAsync(SubmitQuizDTO dto, int userId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == dto.QuizId);

            if (quiz == null) return (false, "Quiz not found.", null);
            if (!quiz.IsActive) return (false, "This quiz is not active.", null);

            var existingAttempt = await _resultRepo.FindAsync(r => r.UserId == userId && r.QuizId == dto.QuizId);
            if (existingAttempt.Any())
            {
                // Delete previous attempt so user can retake
                foreach (var old in existingAttempt)
                    await _resultRepo.DeleteAsync(old);
                var oldAnswers = await _answerRepo.FindAsync(a => a.UserId == userId && a.QuizId == dto.QuizId);
                foreach (var old in oldAnswers)
                    await _answerRepo.DeleteAsync(old);
            }

            int score = 0;
            int totalQuestions = quiz.Questions.Count;
            var answerBreakdown = new List<AnswerResultDTO>();

            // Process each submitted answer
            foreach (var answer in dto.Answers)
            {
                var question = quiz.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question == null) continue;

                var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                var selectedOption = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId);

                bool isCorrect = correctOption != null && answer.SelectedOptionId == correctOption.Id;
                if (isCorrect) score++;

                var userAnswer = new UserAnswer
                {
                    UserId = userId,
                    QuizId = dto.QuizId,
                    QuestionId = answer.QuestionId,
                    SelectedOptionId = answer.SelectedOptionId
                };
                await _answerRepo.AddAsync(userAnswer);

                answerBreakdown.Add(new AnswerResultDTO
                {
                    QuestionId = question.Id,
                    QuestionText = question.QuestionText,
                    SelectedOptionId = answer.SelectedOptionId,
                    SelectedOptionText = selectedOption?.OptionText ?? "Not found",
                    CorrectOptionId = correctOption?.Id ?? 0,
                    CorrectOptionText = correctOption?.OptionText ?? "Not found",
                    IsCorrect = isCorrect
                });
            }

            // Calculate percentage
            double percentage = totalQuestions > 0
                ? Math.Round((double)score / totalQuestions * 100, 2)
                : 0;

            var quizResult = new QuizResult
            {
                UserId = userId,
                QuizId = dto.QuizId,
                Score = score,
                TotalQuestions = totalQuestions,
                Percentage = percentage,
                CompletedAt = DateTime.UtcNow
            };
            await _resultRepo.AddAsync(quizResult);

            var resultDto = new QuizResultDTO
            {
                ResultId = quizResult.Id,
                QuizId = dto.QuizId,
                QuizTitle = quiz.Title,
                Score = score,
                TotalQuestions = totalQuestions,
                Percentage = percentage,
                CompletedAt = quizResult.CompletedAt,
                AnswerBreakdown = answerBreakdown
            };

            return (true, "Quiz submitted successfully.", resultDto);
        }

        public async Task<IEnumerable<QuizResultDTO>> GetUserResultsAsync(int userId)
        {
            var results = await _context.QuizResults
                .Include(r => r.Quiz)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CompletedAt)
                .ToListAsync();

            return results.Select(r => new QuizResultDTO
            {
                ResultId = r.Id,
                QuizId = r.QuizId,
                QuizTitle = r.Quiz?.Title ?? "",
                Score = r.Score,
                TotalQuestions = r.TotalQuestions,
                Percentage = r.Percentage,
                CompletedAt = r.CompletedAt,
                AnswerBreakdown = new List<AnswerResultDTO>() 
            });
        }
    }
}

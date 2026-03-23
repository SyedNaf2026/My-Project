-- Check users
SELECT Id, FullName, Email, Role FROM Users;
select * from Users

-- Check categories
SELECT * FROM Categories;

-- Check quizzes
SELECT q.Id, q.Title, c.Name AS Category, q.TimeLimit, q.IsActive 
FROM Quizzes q
JOIN Categories c ON c.Id = q.CategoryId;

-- Check questions with option counts
SELECT q.Id, q.QuestionText, COUNT(o.Id) AS OptionCount
FROM Questions q
LEFT JOIN Options o ON o.QuestionId = q.Id
GROUP BY q.Id, q.QuestionText
ORDER BY q.Id;

-- Check all options with correct answer marked
SELECT q.QuestionText, o.OptionText, 
       CASE WHEN o.IsCorrect = 1 THEN '✓ Correct' ELSE '' END AS Answer
FROM Questions q
JOIN Options o ON o.QuestionId = q.Id
ORDER BY q.Id, o.Id;

-- Check results and leaderboard (will be empty until someone takes a quiz)
SELECT * FROM QuizResults;
SELECT * FROM UserAnswers;

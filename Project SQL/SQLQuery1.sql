select * from Leaderboards

select * from Users

select * from Category

select * from Leaderboards

select * from Options

SELECT TOP 1 Id
FROM Questions
WHERE QuizId = 2
ORDER BY Id DESC;

SELECT Id, QuizId, QuestionText FROM Questions;
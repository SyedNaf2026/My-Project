select * from Users

select * from Quizzes 

select * from Categories

select * from Questions

select * from Options

select * from QuizResults

select * from UserAnswers

SELECT Id, Title, CreatedBy FROM Quizzes WHERE Id = 3;

INSERT INTO Questions (QuizId, QuestionText)
VALUES (3, 'What is the capital of India?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect)
VALUES 
(3, 'Mumbai', 0),
(3, 'New Delhi', 1),
(3, 'Chennai', 0),
(3, 'Kolkata', 0);

INSERT INTO Questions (QuizId, QuestionText)
VALUES (4, 'What is the recently released feature in automobile industry');

INSERT INTO Options (QuestionId, OptionText, IsCorrect)
VALUES
(2, 'Electric Vehicle Technology', 1),
(2, 'Steam Engine System', 0),
(2, 'Wooden Chassis Design', 0),
(2, 'Animal Powered Transmission', 0);

INSERT INTO Questions (QuizId, QuestionText)
VALUES (2, 'Which language is used in ASP.NET Core?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect)
VALUES
(3, 'Java', 0),
(3, 'C#', 1),
(3, 'Python', 0),
(3, 'PHP', 0);

INSERT INTO QuizResults 
(UserId, QuizId, Score, TotalQuestions, Percentage, CompletedAt)
VALUES 
(2, 2, 8, 10, 80, GETDATE());

INSERT INTO QuizResults 
(UserId, QuizId, Score, TotalQuestions, Percentage, CompletedAt)
VALUES 
(2, 2, 6, 10, 60, GETDATE());

INSERT INTO UserAnswers
(UserId, QuizId, QuestionId, SelectedOptionId)
VALUES
(2, 2, 1, 5);


select * from Users
delete from  Users where Role = 'QuizTaker'
SELECT * FROM Users WHERE Role = 'QuizTaker';


-- Delete all users except Dayanand (11) and Syed Arshed (14)
DELETE FROM Users WHERE Id NOT IN (11, 14);

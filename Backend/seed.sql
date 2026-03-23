-- ============================================================
-- CLEAN SEED SCRIPT FOR QuizzApp Demo
-- Clears all quiz data (keeps Users) and inserts fresh data
-- ============================================================

-- 1. Clear existing data (order matters due to FK constraints)
DELETE FROM UserAnswers;
DELETE FROM QuizResults;
DELETE FROM Options;
DELETE FROM Questions;
DELETE FROM Quizzes;
DELETE FROM Categories;

-- Reset identity seeds
DBCC CHECKIDENT ('Categories', RESEED, 0);
DBCC CHECKIDENT ('Quizzes', RESEED, 0);
DBCC CHECKIDENT ('Questions', RESEED, 0);
DBCC CHECKIDENT ('Options', RESEED, 0);

-- ============================================================
-- 2. CATEGORIES (5 categories)
-- ============================================================
INSERT INTO Categories (Name, Description) VALUES
('General Knowledge',  'Test your everyday general knowledge'),
('Technology',         'Questions on computers, software and the internet'),
('Science',            'Physics, Chemistry, Biology and more'),
('Sports',             'Cricket, Football, Olympics and world sports'),
('Geography',          'Countries, capitals, rivers and world geography');

-- ============================================================
-- 3. QUIZZES  (2 per category = 10 quizzes)
-- CreatedBy = 11 (Dayanand - QuizCreator)
-- ============================================================
INSERT INTO Quizzes (Title, Description, CategoryId, CreatedBy, TimeLimit, IsActive, CreatedAt) VALUES
-- General Knowledge
('GK Basics',           'Basic general knowledge for everyone',         1, 11, 10, 1, GETDATE()),
('World Facts',         'Interesting facts about the world',            1, 11, 10, 1, GETDATE()),
-- Technology
('Tech Fundamentals',   'Core concepts in technology and computing',    2, 11, 10, 1, GETDATE()),
('Web Development',     'HTML, CSS, JavaScript and frameworks',         2, 11, 10, 1, GETDATE()),
-- Science
('Science Basics',      'Fundamental science questions',                3, 11, 10, 1, GETDATE()),
('Human Body',          'Questions about the human body and biology',   3, 11, 10, 1, GETDATE()),
-- Sports
('Cricket Quiz',        'All about cricket — the gentleman''s game',    4, 11, 10, 1, GETDATE()),
('Football Quiz',       'World football and FIFA trivia',               4, 11, 10, 1, GETDATE()),
-- Geography
('Indian Geography',    'Rivers, states, capitals of India',            5, 11, 10, 1, GETDATE()),
('World Geography',     'Countries, capitals and continents',           5, 11, 10, 1, GETDATE());

-- ============================================================
-- 4. QUESTIONS & OPTIONS
-- Each quiz gets 4 questions, each question gets 4 options
-- ============================================================

-- -------------------------------------------------------
-- QUIZ 1: GK Basics (QuizId = 1)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(1, 'Who wrote the national anthem of India?'),
(1, 'How many days are there in a leap year?'),
(1, 'What is the largest planet in our solar system?'),
(1, 'Which metal is liquid at room temperature?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(1, 'Rabindranath Tagore',  1), (1, 'Mahatma Gandhi', 0), (1, 'Jawaharlal Nehru', 0), (1, 'Subhas Chandra Bose', 0),
(2, '366',                  1), (2, '365', 0),             (2, '364', 0),              (2, '367', 0),
(3, 'Jupiter',              1), (3, 'Saturn', 0),          (3, 'Neptune', 0),          (3, 'Mars', 0),
(4, 'Mercury',              1), (4, 'Iron', 0),            (4, 'Gold', 0),             (4, 'Silver', 0);

-- -------------------------------------------------------
-- QUIZ 2: World Facts (QuizId = 2)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(2, 'Which is the longest river in the world?'),
(2, 'Which country has the largest population in the world?'),
(2, 'What is the smallest country in the world?'),
(2, 'Which ocean is the largest?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(5, 'Nile',          1), (5, 'Amazon', 0),       (5, 'Yangtze', 0),    (5, 'Mississippi', 0),
(6, 'India',         1), (6, 'China', 0),         (6, 'USA', 0),        (6, 'Indonesia', 0),
(7, 'Vatican City',  1), (7, 'Monaco', 0),        (7, 'San Marino', 0), (7, 'Liechtenstein', 0),
(8, 'Pacific Ocean', 1), (8, 'Atlantic Ocean', 0),(8, 'Indian Ocean', 0),(8, 'Arctic Ocean', 0);

-- -------------------------------------------------------
-- QUIZ 3: Tech Fundamentals (QuizId = 3)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(3, 'What does CPU stand for?'),
(3, 'Which programming language is known as the mother of all languages?'),
(3, 'What does RAM stand for?'),
(3, 'Which company developed the Windows operating system?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(9,  'Central Processing Unit',  1), (9,  'Central Program Unit', 0),   (9,  'Computer Processing Unit', 0), (9,  'Core Processing Unit', 0),
(10, 'C',                        1), (10, 'Python', 0),                  (10, 'Java', 0),                     (10, 'COBOL', 0),
(11, 'Random Access Memory',     1), (11, 'Read Access Memory', 0),      (11, 'Run Access Memory', 0),        (11, 'Rapid Access Memory', 0),
(12, 'Microsoft',                1), (12, 'Apple', 0),                   (12, 'Google', 0),                   (12, 'IBM', 0);

-- -------------------------------------------------------
-- QUIZ 4: Web Development (QuizId = 4)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(4, 'What does HTML stand for?'),
(4, 'Which language is used for styling web pages?'),
(4, 'What does API stand for?'),
(4, 'Which JavaScript framework is developed by Google?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(13, 'HyperText Markup Language',   1), (13, 'HighText Machine Language', 0), (13, 'HyperText Machine Language', 0), (13, 'HyperTool Markup Language', 0),
(14, 'CSS',                         1), (14, 'JavaScript', 0),                (14, 'Python', 0),                     (14, 'XML', 0),
(15, 'Application Programming Interface', 1), (15, 'Applied Program Interface', 0), (15, 'Application Process Interface', 0), (15, 'Automated Program Interface', 0),
(16, 'Angular',                     1), (16, 'React', 0),                     (16, 'Vue', 0),                        (16, 'Svelte', 0);

-- -------------------------------------------------------
-- QUIZ 5: Science Basics (QuizId = 5)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(5, 'What is the chemical symbol for water?'),
(5, 'How many bones are in the adult human body?'),
(5, 'What is the speed of light (approx)?'),
(5, 'Which gas do plants absorb from the atmosphere?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(17, 'H2O',          1), (17, 'CO2', 0),          (17, 'O2', 0),           (17, 'H2', 0),
(18, '206',          1), (18, '208', 0),           (18, '200', 0),          (18, '212', 0),
(19, '3 x 10^8 m/s', 1), (19, '3 x 10^6 m/s', 0), (19, '3 x 10^10 m/s', 0),(19, '3 x 10^4 m/s', 0),
(20, 'Carbon Dioxide',1),(20, 'Oxygen', 0),         (20, 'Nitrogen', 0),     (20, 'Hydrogen', 0);

-- -------------------------------------------------------
-- QUIZ 6: Human Body (QuizId = 6)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(6, 'Which is the largest organ in the human body?'),
(6, 'How many chambers does the human heart have?'),
(6, 'Which blood group is known as the universal donor?'),
(6, 'What is the powerhouse of the cell?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(21, 'Skin',         1), (21, 'Liver', 0),     (21, 'Brain', 0),    (21, 'Lungs', 0),
(22, '4',            1), (22, '2', 0),          (22, '3', 0),        (22, '6', 0),
(23, 'O negative',   1), (23, 'A positive', 0), (23, 'B negative', 0),(23, 'AB positive', 0),
(24, 'Mitochondria', 1), (24, 'Nucleus', 0),    (24, 'Ribosome', 0), (24, 'Vacuole', 0);

-- -------------------------------------------------------
-- QUIZ 7: Cricket Quiz (QuizId = 7)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(7, 'How many players are there in a cricket team?'),
(7, 'Which country won the first Cricket World Cup in 1975?'),
(7, 'What is the maximum number of overs in a One Day International?'),
(7, 'Who holds the record for the highest individual score in Test cricket?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(25, '11',           1), (25, '9', 0),          (25, '12', 0),        (25, '10', 0),
(26, 'West Indies',  1), (26, 'Australia', 0),   (26, 'England', 0),   (26, 'India', 0),
(27, '50',           1), (27, '40', 0),          (27, '60', 0),        (27, '45', 0),
(28, 'Brian Lara',   1), (28, 'Sachin Tendulkar',0),(28, 'Ricky Ponting',0),(28, 'Don Bradman', 0);

-- -------------------------------------------------------
-- QUIZ 8: Football Quiz (QuizId = 8)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(8, 'Which country won the FIFA World Cup 2022?'),
(8, 'How many players are on the field per team in football?'),
(8, 'Which player has won the most Ballon d''Or awards?'),
(8, 'How long is a standard football match?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(29, 'Argentina',    1), (29, 'France', 0),      (29, 'Brazil', 0),    (29, 'Germany', 0),
(30, '11',           1), (30, '10', 0),           (30, '12', 0),        (30, '9', 0),
(31, 'Lionel Messi', 1), (31, 'Cristiano Ronaldo',0),(31, 'Ronaldinho',0),(31, 'Zinedine Zidane',0),
(32, '90 minutes',   1), (32, '80 minutes', 0),   (32, '100 minutes', 0),(32, '75 minutes', 0);

-- -------------------------------------------------------
-- QUIZ 9: Indian Geography (QuizId = 9)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(9, 'What is the capital of India?'),
(9, 'Which is the longest river in India?'),
(9, 'How many states are there in India?'),
(9, 'Which is the largest state in India by area?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(33, 'New Delhi',    1), (33, 'Mumbai', 0),      (33, 'Kolkata', 0),   (33, 'Chennai', 0),
(34, 'Ganga',        1), (34, 'Yamuna', 0),       (34, 'Godavari', 0),  (34, 'Brahmaputra', 0),
(35, '28',           1), (35, '29', 0),           (35, '27', 0),        (35, '30', 0),
(36, 'Rajasthan',    1), (36, 'Madhya Pradesh', 0),(36, 'Maharashtra', 0),(36, 'Uttar Pradesh', 0);

-- -------------------------------------------------------
-- QUIZ 10: World Geography (QuizId = 10)
-- -------------------------------------------------------
INSERT INTO Questions (QuizId, QuestionText) VALUES
(10, 'What is the capital of Australia?'),
(10, 'Which is the largest continent?'),
(10, 'Which country has the most natural lakes?'),
(10, 'What is the tallest mountain in the world?');

INSERT INTO Options (QuestionId, OptionText, IsCorrect) VALUES
(37, 'Canberra',     1), (37, 'Sydney', 0),      (37, 'Melbourne', 0), (37, 'Brisbane', 0),
(38, 'Asia',         1), (38, 'Africa', 0),       (38, 'Europe', 0),    (38, 'North America', 0),
(39, 'Canada',       1), (39, 'Russia', 0),       (39, 'USA', 0),       (39, 'Finland', 0),
(40, 'Mount Everest',1), (40, 'K2', 0),           (40, 'Kangchenjunga',0),(40, 'Lhotse', 0);

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'Categories' AS TableName, COUNT(*) AS Total FROM Categories
UNION ALL SELECT 'Quizzes', COUNT(*) FROM Quizzes
UNION ALL SELECT 'Questions', COUNT(*) FROM Questions
UNION ALL SELECT 'Options', COUNT(*) FROM Options;

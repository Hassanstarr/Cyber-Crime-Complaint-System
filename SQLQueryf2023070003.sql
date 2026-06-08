-- ================================
-- 1. CREATE DATABASE
-- ================================
CREATE DATABASE CyberCrimeDB;
GO

USE CyberCrimeDB;
GO

-- ================================
-- 2. USERS TABLE
-- ================================
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ================================
-- 3. ADMINS TABLE
-- ================================
CREATE TABLE Admins (
    AdminID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL
);

-- ================================
-- 4. CATEGORIES TABLE
-- ================================
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE
);

-- ================================
-- 5. COMPLAINTS TABLE (UPDATED)
-- ================================
CREATE TABLE Complaints (
    ComplaintID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NOT NULL,
    CategoryID INT NOT NULL,

    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    EvidenceURL NVARCHAR(255) NULL,

    -- DEFAULT + CHECK constraint together (IMPORTANT FIX)
    Status NVARCHAR(50) DEFAULT 'Pending'
        CHECK (Status IN ('Pending', 'In Progress', 'Resolved', 'Rejected')),

    CreatedAt DATETIME DEFAULT GETDATE(),

    -- Foreign Keys
    CONSTRAINT FK_Complaints_Users
        FOREIGN KEY (UserID) REFERENCES Users(UserID),

    CONSTRAINT FK_Complaints_Categories
        FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- ================================
-- 6. COMPLAINT STATUS HISTORY
-- ================================
CREATE TABLE ComplaintStatusHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,

    ComplaintID INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,

    UpdatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_History_Complaint
        FOREIGN KEY (ComplaintID) REFERENCES Complaints(ComplaintID),

    CHECK (Status IN ('Pending', 'In Progress', 'Resolved', 'Rejected'))
);

-- ================================
-- 7. SAMPLE DATA
-- ================================

INSERT INTO Users (FullName, Email, Password, Phone)
VALUES 
('Ali Khan', 'ali@gmail.com', '12345', '03001234567'),
('Sara Ahmed', 'sara@gmail.com', '12345', '03111222333');

INSERT INTO Admins (Username, Password)
VALUES 
('admin1', 'admin123');

INSERT INTO Categories (CategoryName)
VALUES 
('Hacking'),
('Fraud'),
('Cyber Bullying'),
('Phishing'),
('Identity Theft');

INSERT INTO Complaints (UserID, CategoryID, Title, Description)
VALUES 
(1, 1, 'Facebook Hacked', 'My account was hacked'),
(2, 4, 'Fake Email Scam', 'Received phishing email');

-- ================================
-- 8. UPDATE EXAMPLE
-- ================================
UPDATE Complaints
SET Status = 'In Progress'
WHERE ComplaintID = 1;
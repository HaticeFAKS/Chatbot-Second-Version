-- ZetaCAD Chatbot Veritabanı Kurulum Script
-- Chat-dipos örneğinden uyarlanmıştır

-- Veritabanını oluştur
CREATE DATABASE ZetaCADChatDB;
GO

-- Login oluştur
CREATE LOGIN ZetaChatLogin 
WITH PASSWORD = 'ZetaCAD2025Secure!Pass';
GO

-- Chatbot veritabanını kullan
USE ZetaCADChatDB;
GO

-- Login'e bağlı kullanıcı oluştur
CREATE USER ZetaChatUser 
FOR LOGIN ZetaChatLogin;
GO

-- Kullanıcıya db_owner yetkisi ver
ALTER ROLE db_owner ADD MEMBER ZetaChatUser;
GO

-- ChatBotLog tablosu
CREATE TABLE [dbo].[ChatBotLog](
    [id] INT IDENTITY(1,1) NOT NULL,
    [sessionConversation] VARCHAR(MAX) NULL,
    [sessionDate] DATETIME2 NULL,
    [userFeedBack] TINYINT NULL,
    [sessionId] VARCHAR(255) NULL,
    CONSTRAINT PK_ChatBotLog PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- ChatBotUserSession tablosu
CREATE TABLE [dbo].[ChatBotUserSession](
    [Id] INT IDENTITY(1,1) NOT NULL,
    [SelectedPfirmId] INT NULL,
    [PfirmDfirmId] INT NULL,
    [UserId] INT NULL,
    CONSTRAINT PK_ChatBotUserSession PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Indexler
CREATE NONCLUSTERED INDEX IX_ChatBotLog_SessionDate 
ON [dbo].[ChatBotLog]([sessionDate] ASC);
GO

CREATE NONCLUSTERED INDEX IX_ChatBotLog_UserFeedBack 
ON [dbo].[ChatBotLog]([userFeedBack] ASC);
GO
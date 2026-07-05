using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITechDigitalTradeHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPanelPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // This schema may already exist because the earlier recommendation SQL was
            // intentionally safe to run manually. Keep the EF migration reconcilable.
            migrationBuilder.Sql(@"
IF COL_LENGTH('Courses', 'DifficultyScore') IS NULL ALTER TABLE [Courses] ADD [DifficultyScore] tinyint NULL;
IF COL_LENGTH('Courses', 'EstimatedWeeks') IS NULL ALTER TABLE [Courses] ADD [EstimatedWeeks] int NULL;
IF COL_LENGTH('Courses', 'LearningGoal') IS NULL ALTER TABLE [Courses] ADD [LearningGoal] tinyint NULL;
IF COL_LENGTH('Courses', 'LearningOutcomes') IS NULL ALTER TABLE [Courses] ADD [LearningOutcomes] nvarchar(max) NULL;
IF COL_LENGTH('Courses', 'PrerequisitesSummary') IS NULL ALTER TABLE [Courses] ADD [PrerequisitesSummary] nvarchar(max) NULL;
IF COL_LENGTH('Courses', 'ProjectBased') IS NULL ALTER TABLE [Courses] ADD [ProjectBased] bit NOT NULL CONSTRAINT [DF_Courses_ProjectBased] DEFAULT (0);
IF COL_LENGTH('Courses', 'RequiresMentor') IS NULL ALTER TABLE [Courses] ADD [RequiresMentor] bit NOT NULL CONSTRAINT [DF_Courses_RequiresMentor] DEFAULT (0);
IF COL_LENGTH('Courses', 'TargetRole') IS NULL ALTER TABLE [Courses] ADD [TargetRole] tinyint NULL;
IF COL_LENGTH('Courses', 'WeeklyHoursMax') IS NULL ALTER TABLE [Courses] ADD [WeeklyHoursMax] int NULL;
IF COL_LENGTH('Courses', 'WeeklyHoursMin') IS NULL ALTER TABLE [Courses] ADD [WeeklyHoursMin] int NULL;

IF OBJECT_ID(N'[CoursePrerequisiteTags]', N'U') IS NULL
BEGIN
    CREATE TABLE [CoursePrerequisiteTags] (
        [CourseId] bigint NOT NULL,
        [TagId] bigint NOT NULL,
        [MinimumLevel] tinyint NOT NULL,
        CONSTRAINT [PK_CoursePrerequisiteTags] PRIMARY KEY ([CourseId], [TagId]),
        CONSTRAINT [FK_CoursePrerequisiteTags_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([ID]) ON DELETE CASCADE,
        CONSTRAINT [FK_CoursePrerequisiteTags_Tags_TagId] FOREIGN KEY ([TagId]) REFERENCES [Tags] ([ID])
    );
END;

IF OBJECT_ID(N'[CourseSkillTags]', N'U') IS NULL
BEGIN
    CREATE TABLE [CourseSkillTags] (
        [CourseId] bigint NOT NULL,
        [TagId] bigint NOT NULL,
        [Weight] tinyint NOT NULL,
        CONSTRAINT [PK_CourseSkillTags] PRIMARY KEY ([CourseId], [TagId]),
        CONSTRAINT [FK_CourseSkillTags_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([ID]) ON DELETE CASCADE,
        CONSTRAINT [FK_CourseSkillTags_Tags_TagId] FOREIGN KEY ([TagId]) REFERENCES [Tags] ([ID])
    );
END;

IF OBJECT_ID(N'[CourseTargetRoleTags]', N'U') IS NULL
BEGIN
    CREATE TABLE [CourseTargetRoleTags] (
        [CourseId] bigint NOT NULL,
        [TagId] bigint NOT NULL,
        [Weight] tinyint NOT NULL,
        CONSTRAINT [PK_CourseTargetRoleTags] PRIMARY KEY ([CourseId], [TagId]),
        CONSTRAINT [FK_CourseTargetRoleTags_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([ID]) ON DELETE CASCADE,
        CONSTRAINT [FK_CourseTargetRoleTags_Tags_TagId] FOREIGN KEY ([TagId]) REFERENCES [Tags] ([ID])
    );
END;

IF OBJECT_ID(N'[EducationQuestionnaireQuestions]', N'U') IS NULL
BEGIN
    CREATE TABLE [EducationQuestionnaireQuestions] (
        [ID] bigint IDENTITY(1,1) NOT NULL CONSTRAINT [PK_EducationQuestionnaireQuestions] PRIMARY KEY,
        [Code] nvarchar(80) NOT NULL,
        [Title] nvarchar(240) NOT NULL,
        [HelpText] nvarchar(500) NULL,
        [QuestionType] tinyint NOT NULL,
        [SortOrder] int NOT NULL,
        [IsRequired] bit NOT NULL,
        [CreateDate] datetime2 NULL,
        [UpdateDate] datetime2 NULL,
        [DeleteDate] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [CreatorId] bigint NULL,
        [OtherLangs] nvarchar(max) NULL
    );
END;

IF OBJECT_ID(N'[UserPanelPreferences]', N'U') IS NULL
BEGIN
    CREATE TABLE [UserPanelPreferences] (
        [ID] bigint IDENTITY(1,1) NOT NULL CONSTRAINT [PK_UserPanelPreferences] PRIMARY KEY,
        [UserId] bigint NOT NULL,
        [PanelKey] nvarchar(40) NOT NULL,
        [ThemeKey] nvarchar(40) NOT NULL,
        [DensityKey] nvarchar(24) NOT NULL,
        [FontScale] nvarchar(24) NOT NULL,
        [SidebarMode] nvarchar(24) NOT NULL,
        [CardOrderJson] nvarchar(max) NULL,
        [CreateDate] datetime2 NULL,
        [UpdateDate] datetime2 NULL,
        [DeleteDate] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [CreatorId] bigint NULL,
        [OtherLangs] nvarchar(max) NULL,
        CONSTRAINT [FK_UserPanelPreferences_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([ID]) ON DELETE CASCADE
    );
END;

IF OBJECT_ID(N'[EducationQuestionnaireOptions]', N'U') IS NULL
BEGIN
    CREATE TABLE [EducationQuestionnaireOptions] (
        [ID] bigint IDENTITY(1,1) NOT NULL CONSTRAINT [PK_EducationQuestionnaireOptions] PRIMARY KEY,
        [QuestionId] bigint NOT NULL,
        [Value] nvarchar(100) NOT NULL,
        [Label] nvarchar(220) NOT NULL,
        [SortOrder] int NOT NULL,
        [LearningGoal] tinyint NULL,
        [TargetRole] tinyint NULL,
        [Level] tinyint NULL,
        [PreferredMode] tinyint NULL,
        [WeeklyHoursMin] int NULL,
        [WeeklyHoursMax] int NULL,
        [SkillTagId] bigint NULL,
        [Weight] tinyint NOT NULL,
        [CreateDate] datetime2 NULL,
        [UpdateDate] datetime2 NULL,
        [DeleteDate] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [CreatorId] bigint NULL,
        [OtherLangs] nvarchar(max) NULL,
        CONSTRAINT [FK_EducationQuestionnaireOptions_EducationQuestionnaireQuestions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [EducationQuestionnaireQuestions] ([ID]) ON DELETE CASCADE,
        CONSTRAINT [FK_EducationQuestionnaireOptions_Tags_SkillTagId] FOREIGN KEY ([SkillTagId]) REFERENCES [Tags] ([ID])
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_Courses_LearningGoal_TargetRole_Level_DeliveryMode' AND [object_id] = OBJECT_ID(N'[Courses]'))
    CREATE INDEX [IX_Courses_LearningGoal_TargetRole_Level_DeliveryMode] ON [Courses] ([LearningGoal], [TargetRole], [Level], [DeliveryMode]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_Courses_WeeklyHoursMin_WeeklyHoursMax' AND [object_id] = OBJECT_ID(N'[Courses]'))
    CREATE INDEX [IX_Courses_WeeklyHoursMin_WeeklyHoursMax] ON [Courses] ([WeeklyHoursMin], [WeeklyHoursMax]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_CoursePrerequisiteTags_TagId' AND [object_id] = OBJECT_ID(N'[CoursePrerequisiteTags]'))
    CREATE INDEX [IX_CoursePrerequisiteTags_TagId] ON [CoursePrerequisiteTags] ([TagId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_CourseSkillTags_TagId' AND [object_id] = OBJECT_ID(N'[CourseSkillTags]'))
    CREATE INDEX [IX_CourseSkillTags_TagId] ON [CourseSkillTags] ([TagId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_CourseTargetRoleTags_TagId' AND [object_id] = OBJECT_ID(N'[CourseTargetRoleTags]'))
    CREATE INDEX [IX_CourseTargetRoleTags_TagId] ON [CourseTargetRoleTags] ([TagId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_EducationQuestionnaireOptions_QuestionId_SortOrder' AND [object_id] = OBJECT_ID(N'[EducationQuestionnaireOptions]'))
    CREATE INDEX [IX_EducationQuestionnaireOptions_QuestionId_SortOrder] ON [EducationQuestionnaireOptions] ([QuestionId], [SortOrder]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_EducationQuestionnaireOptions_SkillTagId' AND [object_id] = OBJECT_ID(N'[EducationQuestionnaireOptions]'))
    CREATE INDEX [IX_EducationQuestionnaireOptions_SkillTagId] ON [EducationQuestionnaireOptions] ([SkillTagId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_EducationQuestionnaireQuestions_Code' AND [object_id] = OBJECT_ID(N'[EducationQuestionnaireQuestions]'))
    CREATE UNIQUE INDEX [IX_EducationQuestionnaireQuestions_Code] ON [EducationQuestionnaireQuestions] ([Code]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_EducationQuestionnaireQuestions_SortOrder' AND [object_id] = OBJECT_ID(N'[EducationQuestionnaireQuestions]'))
    CREATE INDEX [IX_EducationQuestionnaireQuestions_SortOrder] ON [EducationQuestionnaireQuestions] ([SortOrder]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_UserPanelPreferences_UserId_PanelKey' AND [object_id] = OBJECT_ID(N'[UserPanelPreferences]'))
    CREATE UNIQUE INDEX [IX_UserPanelPreferences_UserId_PanelKey] ON [UserPanelPreferences] ([UserId], [PanelKey]);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CoursePrerequisiteTags");

            migrationBuilder.DropTable(
                name: "CourseSkillTags");

            migrationBuilder.DropTable(
                name: "CourseTargetRoleTags");

            migrationBuilder.DropTable(
                name: "EducationQuestionnaireOptions");

            migrationBuilder.DropTable(
                name: "UserPanelPreferences");

            migrationBuilder.DropTable(
                name: "EducationQuestionnaireQuestions");

            migrationBuilder.DropIndex(
                name: "IX_Courses_LearningGoal_TargetRole_Level_DeliveryMode",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_WeeklyHoursMin_WeeklyHoursMax",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "DifficultyScore",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "EstimatedWeeks",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "LearningGoal",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "LearningOutcomes",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "PrerequisitesSummary",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ProjectBased",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "RequiresMentor",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "TargetRole",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "WeeklyHoursMax",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "WeeklyHoursMin",
                table: "Courses");
        }
    }
}

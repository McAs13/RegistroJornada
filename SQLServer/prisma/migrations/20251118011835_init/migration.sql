BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Employee] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [cedula] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [isAdmin] BIT NOT NULL CONSTRAINT [Employee_isAdmin_df] DEFAULT 0,
    [sedeId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Employee_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Employee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Employee_cedula_key] UNIQUE NONCLUSTERED ([cedula])
);

-- CreateTable
CREATE TABLE [dbo].[Sede] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000),
    [coordinates] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [Sede_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Sede_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Sede_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TimeRecord] (
    [id] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [sedeId] NVARCHAR(1000),
    [recordType] NVARCHAR(1000) NOT NULL,
    [coordinates] NVARCHAR(1000),
    [latitude] FLOAT(53),
    [longitude] FLOAT(53),
    [inSite] BIT,
    [photoUrl] NVARCHAR(1000),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [TimeRecord_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [overtimeMin] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TimeRecord_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TimeRecord_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Employee] ADD CONSTRAINT [Employee_sedeId_fkey] FOREIGN KEY ([sedeId]) REFERENCES [dbo].[Sede]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TimeRecord] ADD CONSTRAINT [TimeRecord_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TimeRecord] ADD CONSTRAINT [TimeRecord_sedeId_fkey] FOREIGN KEY ([sedeId]) REFERENCES [dbo].[Sede]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

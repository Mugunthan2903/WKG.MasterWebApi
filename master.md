# WKG Master Management System

## Project Overview and Purpose

The WKG Master Management System is a comprehensive web application designed for managing various master data entities in a Point of Sale (POS) system. The application provides a modular architecture for handling different types of master data through a standardized SSM (System Support Module) pattern, enabling efficient data management across multiple functional areas.

## Technology Stack and Dependencies

### Backend Technologies (.NET 6.0)
- **Framework**: ASP.NET Core 6.0 Web API
- **Authentication**: JWT Bearer tokens with refresh token support
- **Database**: SQL Server with SQLite support
- **ORM**: WKL.Data custom data access layer
- **Logging**: Serilog with file-based logging
- **Real-time Communication**: SignalR for notifications
- **API Documentation**: Swagger/OpenAPI
- **Serialization**: Newtonsoft.Json
- **Security**: WKL.Security framework

### Frontend Technologies (React 18.2.0)
- **Framework**: React 18.2.0 with functional and class components
- **Build Tool**: React Scripts 5.0.1
- **Styling**: Bootstrap 5.3.2, SASS, custom CSS
- **Icons**: Font Awesome 5.15.4, Bootstrap Icons
- **State Management**: Custom WKL state management system
- **Maps Integration**: Google Maps API
- **Color Picker**: React Color
- **Date/Time**: Moment.js
- **HTTP Client**: Fetch API with custom ApiManager

### Key NuGet Packages
```xml
<PackageReference Include="Microsoft.AspNetCore.Mvc.NewtonsoftJson" Version="6.0.25" />
<PackageReference Include="Serilog.AspNetCore" Version="6.1.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
<PackageReference Include="WKL.Data" Version="1.0.5" />
<PackageReference Include="WKL.Security" Version="1.0.0" />
<PackageReference Include="WKL.Web.Core" Version="1.0.0" />
```

## Project Architecture

### Solution Structure
The solution consists of two main projects:

1. **WKG.MasterWebApi** - ASP.NET Core Web API project (Backend + Frontend hosting)
2. **WKG.Masters** - Class library containing business logic and data models

### High-Level Architecture
```
┌─────────────────────┐    ┌─────────────────────┐
│  React Frontend     │────│  ASP.NET Core API   │
│  (UIPages/src)      │    │  (Controllers)      │
└─────────────────────┘    └─────────────────────┘
                                      │
                           ┌─────────────────────┐
                           │  Business Logic     │
                           │  (WKG.Masters)      │
                           └─────────────────────┘
                                      │
                           ┌─────────────────────┐
                           │  Database Layer     │
                           │  (WKL.Data)         │
                           └─────────────────────┘
```

## File Structure Explanation

### WKG.MasterWebApi Project
```
WKG.MasterWebApi/
├── Controllers/          # API controllers for each SSM/SMST module
├── Core/                # Base controllers and security components
│   ├── Security/        # API key authentication and authorization
│   └── Services/        # Core services (Token management, SignalR)
├── Files/               # File storage and database files
├── Model/               # API-specific models and constants
├── UIPages/             # React frontend application
│   ├── src/
│   │   ├── components/  # React components organized by module
│   │   │   ├── Common/  # Shared UI components
│   │   │   ├── SSM/     # SSM module components
│   │   │   ├── SSMMaster/ # SMST module components
│   │   │   └── Sample/  # Sample/demo components
│   │   └── wkl-components/ # Custom WKL UI component library
│   └── public/          # Static assets and configuration
├── Program.cs           # Application startup and configuration
└── appsettings.json     # Application configuration
```

### WKG.Masters Project
```
WKG.Masters/
├── Core/                # Base service manager
├── Model/               # Data transfer objects and business models
├── Services/            # Business logic services
│   ├── Interfaces/      # Service contracts
│   └── [Module]Service.cs # Implementation for each module
└── ServiceExtensions.cs # Dependency injection configuration
```

## SSM Module Pattern and Structure

### Module Naming Convention
- **SSM modules**: SSM### (e.g., SSM005, SSM010, SSM020)
- **SMST modules**: SMST### (e.g., SMST001, SMST002, SMST003)

### Standard SSM Module Components

Each SSM module follows a consistent pattern with these components:

#### Backend Components
1. **Controller** (`SSM###Controller.cs`)
   - Location: `WKG.MasterWebApi/Controllers/`
   - Inherits from `WKLBaseController`
   - Provides API endpoints: OnloadAsync, SearchAsync, SaveAsync

2. **Service Interface** (`ISSM###Service.cs`)
   - Location: `WKG.Masters/Services/Interfaces/`
   - Defines contract for business operations

3. **Service Implementation** (`SSM###Service.cs`)
   - Location: `WKG.Masters/Services/`
   - Inherits from `WKLServiceManger`
   - Contains business logic and database operations

4. **Data Model** (`SSM###Object.cs`)
   - Location: `WKG.Masters/Model/`
   - Contains data transfer objects and related models

#### Frontend Components
1. **React Component** (`index.jsx`)
   - Location: `UIPages/src/components/SSM/SSM###/`
   - Inherits from `WKLComponent`
   - Handles UI rendering and user interactions

2. **View Model** (`SSM###VM.js`)
   - Location: `UIPages/src/components/SSM/SSM###/`
   - Inherits from `VMBase`
   - Contains component logic and state management

### Standard API Endpoints Pattern
```
POST /api/SSM###/SSM###OnloadAsync     # Load initial data and dropdowns
POST /api/SSM###/SSM###SearchAsync     # Search and pagination
POST /api/SSM###/SSM###SaveAsync       # Save/update operations
```

## Controllers, Services, and Interfaces Structure

### Base Controller (`WKLBaseController`)
- Location: `WKG.MasterWebApi/Core/WKLBaseController.cs:14`
- Features:
  - Session information extraction
  - IP address and browser detection
  - MIME type handling
  - Authorization and CORS support

### Service Layer Architecture
- **Base Service Manager**: `WKLServiceManger` provides database utilities
- **Dependency Injection**: All services registered in `ServiceExtensions.cs`
- **Interface Contracts**: Each service implements a corresponding interface
- **Error Handling**: Comprehensive logging and exception management

### Database Access Pattern
- Uses `WKL.Data` framework for database operations
- Supports both SQL Server and SQLite
- Transaction management with rollback capabilities
- Parameterized queries for security

## UI Components Organization

### WKL Component Library
Located in `UIPages/src/wkl-components/`, this custom component library includes:

- **Core Components**: ApiManager, SessionManager, NotificationManager
- **Form Controls**: WKLTextbox, WKLSelect, WKLDatepicker, WKLGrid
- **Layout Components**: WKLContainer, WKLControl, WKLTab
- **Utility Components**: WKLToaster, WKLOverlay, WKLTooltip

### Component Hierarchy
```
WKLComponent (Base)
├── VMBase (View Model Base)
└── Custom Components
    ├── SSM Modules
    ├── SMST Modules
    └── Common Components
```

### State Management
- **WKLStateManager**: Centralized state management
- **VMBase**: Base view model class for components
- **Context Providers**: WKLContext and WKLTabContext

## Development Guidelines and Conventions

### Code Structure Conventions
1. **Naming**: 
   - Controllers: `[Module]Controller.cs`
   - Services: `[Module]Service.cs`
   - Interfaces: `I[Module]Service.cs`
   - Models: `[Module]Object.cs`
   - UI Components: `[Module]/index.jsx` with `[Module]VM.js`

2. **API Endpoints**:
   - Follow pattern: `[Module][Action]Async`
   - Always return appropriate response types
   - Include comprehensive error handling

3. **Database Operations**:
   - Use parameterized queries
   - Implement transaction management
   - Include detailed logging

4. **Frontend Components**:
   - Inherit from `WKLComponent`
   - Use corresponding VM class for logic
   - Follow Bootstrap styling conventions
   - Implement proper cleanup in `destroy()` method

### Security Guidelines
- JWT authentication with refresh tokens
- CORS configuration for allowed origins
- Session management and timeout handling
- Secure database parameter binding

## How to Add New SSM Modules

### Step-by-Step Process

#### 1. Backend Implementation

**Create Data Model** (`WKG.Masters/Model/SSM###Object.cs`):
```csharp
public class SSM###Object
{
    // Define properties based on database schema
    public string PropertyName { get; set; }
    public int PageNo { get; set; }
    public int PageSize { get; set; }
    public bool SortTyp { get; set; }
}
```

**Create Service Interface** (`WKG.Masters/Services/Interfaces/ISSM###Service.cs`):
```csharp
public interface ISSM###Service : IDisposable
{
    Task<SSM###loadObject> SSM###GetOnloadAsync(SessionInfo sessionInfo, SSM###Object input);
    Task<PageInfo<SSM###Object>> SSM###GetSearchAsync(SessionInfo sessionInfo, SSM###Object input);
    Task<OperationStatus> SSM###SaveAsync(SessionInfo sessionInfo, SSM###Object input);
}
```

**Create Service Implementation** (`WKG.Masters/Services/SSM###Service.cs`):
```csharp
public class SSM###Service : WKLServiceManger, ISSM###Service
{
    public SSM###Service(IServiceProvider serviceProvider, ILogger<SSM###Service> logger) 
        : base(serviceProvider, logger) { }
    
    // Implement interface methods
}
```

**Create API Controller** (`WKG.MasterWebApi/Controllers/SSM###Controller.cs`):
```csharp
[Route("api/[controller]")]
[ApiController]
public class SSM###Controller : WKLBaseController
{
    private readonly ISSM###Service _service;
    
    public SSM###Controller(ISSM###Service service)
    {
        this._service = service;
    }
    
    // Implement standard endpoints
}
```

**Register Service** in `WKG.Masters/ServiceExtensions.cs`:
```csharp
services.AddScoped<ISSM###Service, SSM###Service>();
```

#### 2. Frontend Implementation

**Create Component Directory**: `UIPages/src/components/SSM/SSM###/`

**Create View Model** (`SSM###VM.js`):
```javascript
import { VMBase } from "../../../wkl-components";

export default class SSM### extends VMBase {
    constructor(props) {
        super(props);
        this.init();
        this._WebApi = 'SSM###';
    }
    
    init() {
        // Initialize component data structure
    }
}
```

**Create React Component** (`index.jsx`):
```javascript
import React from 'react';
import SSM###VM from './SSM###VM';
import * as cntrl from '../../../wkl-components';

export default class SSM### extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM###VM(props));
    }
    
    // Implement component methods
}
```

## Setup and Running Instructions

### Prerequisites
- .NET 6.0 SDK
- Node.js (for React frontend)
- SQL Server or SQLite database
- Visual Studio 2022 or VS Code

### Database Setup
1. Configure connection string in `appsettings.json`
2. Ensure database schema matches the expected table structure
3. SQLite database file location: `Files/DB File/SqliteDB.db`

### Backend Setup
1. Navigate to project root directory
2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```
3. Build the solution:
   ```bash
   dotnet build
   ```

### Frontend Setup
1. Navigate to UIPages directory:
   ```bash
   cd WKG.MasterWebApi/UIPages
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Build CSS from SASS:
   ```bash
   npm run build-css
   ```

### Running the Application

#### Development Mode
1. Start the React development server:
   ```bash
   cd WKG.MasterWebApi/UIPages
   npm start
   ```
2. Run the API in Visual Studio or:
   ```bash
   dotnet run --project WKG.MasterWebApi
   ```

#### Production Mode
1. Build React application:
   ```bash
   cd WKG.MasterWebApi/UIPages
   npm run build
   ```
2. Run the API (serves both API and static files):
   ```bash
   dotnet run --project WKG.MasterWebApi
   ```

### Configuration

#### API Configuration (`appsettings.json`)
```json
{
  "WKL": {
    "CorsIPs": ["https://localhost:3000", "http://localhost:3000"],
    "DBConfiguration": {
      "WriteConnectionString": "Server=...;Database=...;",
      "ReadConnectionString": "Server=...;Database=...;",
      "ProviderName": "System.Data.SqlClient"
    },
    "JwtOptions": {
      "SecretKey": "your-secret-key",
      "Issuer": "http://localhost:7038",
      "Audience": "WKG"
    }
  }
}
```

#### Frontend Configuration (`public/config.json`)
```json
{
  "ServiceUrl": "https://localhost:7038/api",
  "LoginUrl": "https://localhost:7038"
}
```

## Key Features

### Authentication System
- JWT-based authentication with automatic token refresh
- Session management with timeout handling
- Multi-level authorization support

### Module System
- Standardized SSM and SMST module patterns
- Consistent API endpoints and data flow
- Reusable UI components and view models

### Data Management
- CRUD operations with transaction support
- Pagination and sorting capabilities
- Real-time notifications via SignalR

### UI Framework
- Custom WKL component library
- Responsive Bootstrap-based design
- Tab-based navigation system
- Modal dialogs and notifications

### File Management
- File upload/download capabilities
- Image handling with FTP support
- MIME type detection and handling

## API Documentation

The application includes Swagger documentation available at `/swagger` endpoint when running in development mode.

### Common Response Types
- `OperationStatus`: Standard operation result
- `PageInfo<T>`: Paginated search results
- `SessionInfo`: User session information

### Standard Module Endpoints
Each module typically provides:
- `OnloadAsync`: Initial data loading with dropdown values
- `SearchAsync`: Search with pagination and sorting
- `SaveAsync`: Create/update operations

---

*This documentation provides a comprehensive guide to understanding and contributing to the WKG Master Management System. For specific implementation details, refer to the individual module files and the established patterns.*
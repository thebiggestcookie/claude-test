# Important Details for Product Categorization System

## 1. File Directory Structure

```
product-categorization-system/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── categories/
│   │   ├── attributes/
│   │   ├── products/
│   │   ├── llm/
│   │   ├── grading/
│   │   └── reports/
│   ├── auth/
│   ├── admin/
│   ├── products/
│   └── grading/
├── components/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   └── shared/
├── lib/
│   ├── prisma/
│   ├── llm/
│   └── utils/
├── hooks/
├── styles/
├── public/
├── prisma/
│   └── schema.prisma
├── types/
└── config/
```

## 2. Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                   Int                    @id @default(autoincrement())
  username             String                 @unique
  email                String                 @unique
  password             String
  role                 Role                   @default(USER)
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt
  productGenerations   ProductGeneration[]
  humanGradingSessions HumanGradingSession[]
}

enum Role {
  USER
  ADMIN
  HUMAN_GRADER
}

model Department {
  id         Int        @id @default(autoincrement())
  name       String     @unique
  categories Category[]
}

model Category {
  id               Int       @id @default(autoincrement())
  name             String
  department       Department @relation(fields: [departmentId], references: [id])
  departmentId     Int
  parentCategory   Category?  @relation("SubCategories", fields: [parentCategoryId], references: [id])
  parentCategoryId Int?
  subCategories    Category[] @relation("SubCategories")
  attributes       Attribute[]
  products         Product[]
}

model Attribute {
  id           Int               @id @default(autoincrement())
  name         String
  dataType     String
  isRequired   Boolean           @default(false)
  category     Category          @relation(fields: [categoryId], references: [id])
  categoryId   Int
  options      AttributeOption[]
  productAttributes ProductAttribute[]
}

model AttributeOption {
  id          Int       @id @default(autoincrement())
  value       String
  attribute   Attribute @relation(fields: [attributeId], references: [id])
  attributeId Int
}

model Product {
  id                 Int                @id @default(autoincrement())
  name               String
  description        String?
  category           Category           @relation(fields: [categoryId], references: [id])
  categoryId         Int
  attributes         ProductAttribute[]
  generatedProduct   GeneratedProduct?
  humanGradedProduct HumanGradedProduct?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

model ProductAttribute {
  id          Int       @id @default(autoincrement())
  product     Product   @relation(fields: [productId], references: [id])
  productId   Int
  attribute   Attribute @relation(fields: [attributeId], references: [id])
  attributeId Int
  value       String
}

model LLMProvider {
  id     Int        @id @default(autoincrement())
  name   String     @unique
  apiKey String
  models LLMModel[]
}

model LLMModel {
  id         Int         @id @default(autoincrement())
  name       String
  provider   LLMProvider @relation(fields: [providerId], references: [id])
  providerId Int
  prompts    Prompt[]
}

model Prompt {
  id            Int      @id @default(autoincrement())
  name          String
  content       String
  model         LLMModel @relation(fields: [modelId], references: [id])
  modelId       Int
  tokenLimit    Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ProductGeneration {
  id        Int       @id @default(autoincrement())
  user      User      @relation(fields: [userId], references: [id])
  userId    Int
  input     String
  products  GeneratedProduct[]
  createdAt DateTime  @default(now())
}

model GeneratedProduct {
  id                 Int               @id @default(autoincrement())
  product            Product           @relation(fields: [productId], references: [id])
  productId          Int               @unique
  generation         ProductGeneration @relation(fields: [generationId], references: [id])
  generationId       Int
  aiConfidence       Float
  createdAt          DateTime          @default(now())
}

model HumanGradingSession {
  id         Int                 @id @default(autoincrement())
  user       User                @relation(fields: [userId], references: [id])
  userId     Int
  products   HumanGradedProduct[]
  createdAt  DateTime            @default(now())
  completedAt DateTime?
}

model HumanGradedProduct {
  id              Int                  @id @default(autoincrement())
  product         Product              @relation(fields: [productId], references: [id])
  productId       Int                  @unique
  session         HumanGradingSession  @relation(fields: [sessionId], references: [id])
  sessionId       Int
  categoryId      Int
  aiAttributes    Json
  humanAttributes Json
  isApproved      Boolean
  gradedAt        DateTime             @default(now())
}

model PerformanceMetric {
  id                Int      @id @default(autoincrement())
  date              DateTime @unique
  humanAccuracy     Float
  aiAccuracy        Float
  productsProcessed Int
  tokenUsage        BigInt
  humanSpeed        Float
  aiCoverage        Float
}

model PromptTestResult {
  id        Int      @id @default(autoincrement())
  prompt    Prompt   @relation(fields: [promptId], references: [id])
  promptId  Int
  testDate  DateTime @default(now())
  accuracy  Float
  coverage  Float
  tokenUsage BigInt
}

model ProductUpload {
  id          Int      @id @default(autoincrement())
  user        User     @relation(fields: [userId], references: [id])
  userId      Int
  fileName    String
  status      String
  createdAt   DateTime @default(now())
  completedAt DateTime?
}

model DebugLog {
  id          Int      @id @default(autoincrement())
  sessionId   Int
  sessionType String
  logData     Json
  createdAt   DateTime @default(now())
}
```

## 3. Key Considerations for Interoperability

a. Consistent Data Models:
   - Use Prisma schema as the single source of truth for data models across the application.
   - Ensure all components (product generation, human grading, reporting) use these models consistently.

b. API Structure:
   - Implement a RESTful API structure under `/pages/api/` for all data operations.
   - Use consistent naming conventions and response formats across all API endpoints.

c. State Management:
   - Implement a central state management solution (e.g., React Context or Redux) for sharing data between components.

d. Type Definitions:
   - Create shared type definitions in the `/types/` directory for use across the application.

e. Utility Functions:
   - Implement shared utility functions in `/lib/utils/` for common operations (e.g., data formatting, validation).

f. Configuration:
   - Use a centralized configuration file in `/config/` for app-wide settings.

g. LLM Integration:
   - Create a modular LLM integration system in `/lib/llm/` that can be easily extended to support multiple providers.

h. Attribute System:
   - Implement a flexible attribute system that can be used across product generation, human grading, and reporting.

i. Logging and Debugging:
   - Implement a consistent logging system that can be used across all components.
   - Use the DebugLog model for storing detailed debug information.

j. Error Handling:
   - Implement a consistent error handling and reporting mechanism across all components.

This architecture provides a solid foundation for building a scalable and interoperable Product Categorization System. It allows for easy data flow between different components, provides clear separation of concerns, and facilitates future extensions and modifications.

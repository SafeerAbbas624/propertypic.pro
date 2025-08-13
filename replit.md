# Overview

This is a mobile-first property inspection tool called "ProxyPics" that enables sellers to upload photos and videos of their property through a guided step-by-step process. The application generates unique upload links for each property lead and walks users through a comprehensive inspection checklist for single-family homes, capturing everything from exterior views to interior rooms and utility areas.

**Latest Update (Jan 2025):** Implemented OAuth authentication system where the property owner connects their personal Google Drive account once, and all future property photo uploads from any user go directly to the owner's Google Drive with organized folder structure.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript using Vite as the build tool. It follows a component-based architecture with:
- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: Combines React Context API for inspection workflow state with TanStack Query for server state management
- **UI Framework**: Implements shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Mobile-First Design**: Optimized for mobile devices with camera access capabilities using HTML5 capture attributes

## Backend Architecture
The server uses Express.js with TypeScript in a REST API pattern:
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **File Storage**: Google Drive API integration for organizing property photos in structured folder hierarchies
- **API Design**: RESTful endpoints for property lead management and media upload handling
- **Middleware**: Includes request logging, error handling, and file upload processing with Multer

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Design**: Two main entities - property leads and property media with proper relationships
- **File Storage**: Google Drive with automated folder structure (Adler Capital LLC > Wholesaling Real Estate > Property Photos > [Property Address])
- **Media Organization**: Files are tagged with step IDs and titles for easy identification and retrieval

## Authentication and Media Upload Flow
- **Owner OAuth Setup**: Property owner authenticates once with their Google Drive account via `/admin` page
- **Token-Based Access**: Each property lead gets a unique token for secure, shareable upload access
- **Centralized Storage**: All uploads go directly to owner's personal Google Drive regardless of who uploads
- **Inspection Workflow**: Context-driven step progression through predefined property inspection checklist
- **Media Handling**: Direct upload to owner's Google Drive with automatic folder creation (Adler Capital LLC → Wholesaling Real Estate → Property Photos → [Property Address])
- **Progress Tracking**: Real-time upload progress and completion status tracking
- **Fallback System**: Service account method as backup if OAuth fails

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Google Drive API**: Cloud storage service for property media files with folder organization
- **Google Service Account**: Authentication mechanism for Google Drive API access

## Development Tools
- **Replit Integration**: Development environment with specialized Vite plugins and runtime error handling
- **Drizzle Kit**: Database migration and schema management tools
- **TypeScript**: Type safety across the entire application stack

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system variables
- **Lucide Icons**: Consistent iconography throughout the application
- **shadcn/ui**: Pre-built component library with customizable styling

## Media and File Handling
- **Multer**: Express middleware for handling multipart/form-data file uploads
- **HTML5 File API**: Browser-native camera access and file capture capabilities
- **XMLHttpRequest**: Custom upload progress tracking for media files
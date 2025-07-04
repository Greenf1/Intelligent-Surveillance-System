# SurveillanceIA - Intelligent Surveillance System

## Overview

SurveillanceIA is a web-based intelligent surveillance system designed for monitoring geographical zones without physical infrastructure. The system leverages AI-powered analysis to detect anomalies, suspicious gatherings, and behavioral patterns in real-time. Built as a full-stack application with React frontend and Express backend, it provides a comprehensive dashboard for military intelligence and security operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with dark theme optimized for surveillance operations
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live surveillance data

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time communications
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage**: In-memory storage with optional database persistence

### Database Schema
- **Users**: Authentication and authorization
- **Surveillance Zones**: Geographic areas with monitoring parameters
- **Alerts**: AI-generated notifications with threat levels
- **Metrics**: System performance and surveillance statistics

## Key Components

### Surveillance Dashboard
- Real-time zone monitoring with geographic visualization
- Interactive map display with zone status indicators
- Live metrics overview (active zones, alerts, AI detections, system uptime)
- WebSocket-powered real-time updates

### AI Analysis Engine
- OpenAI GPT-4 integration for behavioral pattern analysis
- Automated alert generation with confidence scoring
- Threat level assessment (0-100 scale)
- Natural language alert descriptions and recommendations

### Zone Management
- Dynamic zone creation and configuration
- Configurable alert thresholds (low/medium/high)
- Geographic coordinates and radius settings
- Active/inactive zone status management

### Alert System
- Multi-level alert classification (critical/warning/info)
- Real-time alert broadcasting via WebSocket
- Alert resolution and tracking
- Historical alert analysis

## Data Flow

1. **Zone Configuration**: Users define surveillance zones with geographic parameters and alert thresholds
2. **Simulation Engine**: Backend generates simulated surveillance data based on zone configurations
3. **AI Analysis**: OpenAI API processes surveillance data to identify patterns and anomalies
4. **Alert Generation**: System creates contextualized alerts with threat assessments
5. **Real-time Broadcasting**: WebSocket pushes alerts and updates to connected clients
6. **Dashboard Display**: Frontend renders real-time surveillance status and alert information

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4 for AI-powered surveillance analysis and alert generation
- **Neon Database**: PostgreSQL hosting for production data persistence
- **WebSocket**: Real-time bidirectional communication between client and server

### Development Tools
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Production build bundling for server code

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- Express server with TypeScript compilation via tsx
- In-memory storage for rapid development iteration
- WebSocket development with runtime error overlay

### Production Build
- Vite production build with optimized client bundles
- ESBuild server compilation to single JavaScript file
- PostgreSQL database with connection pooling
- Environment-based configuration management

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `NODE_ENV`: Environment specification (development/production)

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 04, 2025. Initial setup and OpenAI API key integration for AI-powered surveillance analysis
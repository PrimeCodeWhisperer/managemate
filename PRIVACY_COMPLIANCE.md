# Privacy Compliance Guide

This document outlines ManageMate's privacy compliance features and implementation details for GDPR and EU data protection requirements.

## Overview

ManageMate is designed with privacy-by-design principles and includes comprehensive GDPR compliance features for workforce scheduling and management.

## Implemented Features

### 1. Privacy Policy (`/privacy`)
- Comprehensive GDPR-compliant privacy policy
- Covers all data collection and processing activities
- Available at `/privacy` route
- Accessible from footer and registration flows

### 2. Cookie Consent Management
- **Component**: `src/components/cookie-consent-banner.tsx`
- **Features**:
  - GDPR-compliant cookie consent banner
  - Granular consent options (Essential, Analytics, Marketing)
  - Persistent storage of preferences
  - Customizable cookie settings

### 3. Data Subject Rights Portal (`/data-request`)
- **Features**:
  - Access requests
  - Data rectification requests
  - Data erasure (right to be forgotten)
  - Data portability
  - Processing restriction
  - Objection to processing
  - Consent withdrawal

### 4. Data Processing Infrastructure

#### Data Export Utilities
**File**: `src/lib/data-export.ts`

```typescript
// Export user data for portability requests
exportUserData(userId: string)

// Delete user data for erasure requests
deleteUserData(userId: string, options)

// Get data retention information
getUserDataRetention(userId: string)
```

#### API Endpoints
- **Data Requests**: `src/app/api/data-request/route.ts`
  - Handles all GDPR data subject requests
  - Email notifications to privacy team
  - Confirmation emails to users
  - Request tracking with unique IDs

## Environment Variables

Add these to your `.env.local`:

```bash
# Privacy-related email settings
PRIVACY_EMAIL=privacy@managemate.app
GMAIL_USERNAME=your-gmail@gmail.com
GMAIL_PASSWORD=your-app-password
```

## Data Collection and Processing

### Personal Data Collected

1. **Account Information**
   - Name, email, phone number
   - Employee ID and role
   - Profile preferences

2. **Scheduling Data**
   - Work availability
   - Shift assignments
   - Vacation requests
   - Timesheet information

3. **Technical Data**
   - Authentication tokens (Supabase)
   - Session information
   - Usage analytics (anonymized)

### Legal Basis for Processing

- **Contract Performance**: Core scheduling functionality
- **Legitimate Interests**: Security, analytics, service improvement
- **Consent**: Marketing communications, optional cookies
- **Legal Obligation**: Employment law compliance, tax records

### Data Retention Periods

- **Active Users**: Duration of employment/service
- **Terminated Accounts**: 7 years (employment/tax compliance)
- **Analytics Data**: 2 years (anonymized)
- **Legal Requirements**: As required by Dutch/EU law

## Implementation Checklist

### ✅ Completed
- [x] Privacy Policy page
- [x] Cookie consent banner with granular controls
- [x] Data subject rights request form
- [x] API endpoints for handling requests
- [x] Data export utilities
- [x] Data deletion utilities
- [x] Footer links and navigation
- [x] Email notification system
- [x] Request tracking system

### 📋 Recommended Next Steps

1. **Admin Dashboard Integration**
   - Add admin panel for managing data requests
   - Implement data export/deletion UI for admins
   - Add user data overview pages

2. **Database Schema Updates**
   - Create `data_requests` table for tracking
   - Add audit logs for data access/changes
   - Implement soft deletes for historical data

3. **Enhanced Security**
   - Add two-factor authentication for sensitive operations
   - Implement data access logging
   - Add encryption for sensitive fields

4. **Additional Compliance**
   - Create Terms of Service page
   - Add data processing agreements (DPA) templates
   - Implement breach notification procedures

## Usage Instructions

### For Users
1. **Access Privacy Policy**: Visit `/privacy` to view data practices
2. **Manage Cookies**: Use the consent banner to control cookie preferences
3. **Exercise Data Rights**: Visit `/data-request` to submit GDPR requests

### For Administrators
1. **Handle Data Requests**: Monitor `privacy@managemate.app` for incoming requests
2. **Process Requests**: Use admin tools or data export utilities
3. **Maintain Compliance**: Regular review of data retention and processing

## Database Tables Affected

### Core User Data
- `profiles` - User profile information
- `availabilities` - Work availability data
- `past_shifts` - Historical shift records
- `upcoming_shifts` - Scheduled shifts
- `vacations_requests` - Time-off requests
- `open_shifts` - Shift applications

### Authentication
- Supabase Auth tables (managed automatically)
- Session storage (temporary)

## Legal Compliance Notes

### GDPR Articles Addressed
- **Article 6**: Lawfulness of Processing
- **Article 7**: Conditions for Consent  
- **Article 13**: Information to be Provided
- **Article 15**: Right of Access
- **Article 16**: Right to Rectification
- **Article 17**: Right to Erasure
- **Article 18**: Right to Restriction
- **Article 20**: Right to Data Portability
- **Article 21**: Right to Object
- **Article 25**: Data Protection by Design

### Dutch Data Protection Authority
- Website: https://autoriteitpersoonsgegevens.nl
- Phone: 0900-200 0777
- Users can file complaints if unsatisfied with responses

## Contact Information

**Privacy Officer**: privacy@managemate.app  
**Data Controller**: ManageMate, Netherlands  
**Technical Support**: Check repository issues or contact via GitHub

## Changelog

- **2025-10-27**: Initial privacy compliance implementation
  - Added privacy policy page
  - Implemented cookie consent system
  - Created data rights request portal
  - Added data export/deletion utilities
  - Integrated email notification system
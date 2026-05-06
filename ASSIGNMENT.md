# Take Home Assignment

## Overview

You've been provided with a basic asset management application starter. Your task is to extend this system to properly track mobile phones and tablets across an organization's regional teams.

**Timeline:** You have one week to complete this assignment.

**Expected Effort:** We expect this to take between 4-8 hours of work.

## Context

The organization has:
- Multiple regions (North, South, East, West, Central)
- Users with different roles (Admin, Supervisor, User)
- Mobile devices (phones and tablets) that need to be tracked and assigned to team members across regions

## What's Provided

A working Django + React application with:
- Basic models: `Region`, `User` (minimal), `Asset` (minimal)
- REST API endpoints for basic CRUD operations
- React frontend with:
  - Dashboard showing statistics
  - Asset list and form (complete example)
  - User list (table only)
  - Region list (table only)
- Basic test suite (backend and frontend)
- Seed data: 5 regions, 3 users, 2 assets

## Your Task

Extend the application to properly manage mobile devices across the organization.

### Core Requirements

1. **Extend the Data Models**
   - Figure out what fields are needed for Users
   - Figure out what fields are needed for Assets
   - Establish appropriate relationships between Users, Assets, and Regions

2. **Asset Management**
   - Assets should clearly identify whether they are phones or tablets
   - Assets should have statuses that track their lifecycle
   - Assets should be assignable to users

3. **User Management**
   - Users should have roles
   - Users should belong to regions
   - Create forms and interfaces to manage users

4. **Region Management**
   - Create forms and interfaces to manage regions

5. **Business Rules & Validation**
   - Assets can only be assigned to users in the same region
   - Implement appropriate status workflows
   - Handle edge cases appropriately

6. **User Interface**
   - Make the application presentable, with basic styling or a framework
   - Create any additional pages/interfaces needed for assignments
   - Ensure the application is intuitive and usable

7. **API Development**
   - Create new API endpoints as needed
   - Update existing endpoints if necessary

8. **Testing**
   - All existing tests must pass
   - Do not modify existing test files
   - Write additional tests for your new features

## Important Cases to Consider

Your implementation should handle scenarios such as:
- What happens when you delete a user who has assigned assets?
- What happens when you delete a region that has users/assets?
- Can you reassign an asset directly from one user to another?
- Attempting to assign an asset to a user in a different region
- Attempting to assign an already-assigned asset
- Moving a user between regions

## Optional Enhancements

- Search and filtering by status, region, assignment state
- Enhanced dashboard with breakdowns by status, by region, unassigned count
- Assignment history tracking audit trail of who had what asset when

## Getting Started

1. Read `SETUP.md` for setup instructions
2. Run the application and explore the existing code
3. Plan your approach
4. Implement your solution
5. Test thoroughly

## What We're Looking For

- Your understanding of the specifications
- Your thought process, approach, and decisions
- Your code quality should be is clear well-structured code

We expect you to have a working implementation with as much functionality as possible. We understand that not every aspect may be completed within the time frame, and that's okay. Focus on demonstrating your skills and approach.

### Code Quality

- Write clean, readable code
- Comments are useful but not required
- Prioritize clear code over heavy documentation
- Follow best practices for both Django and React
- Structure your code logically

### Work Independently

- This is an individual assignment
- Please complete this work on your own
- Keep your code private at all times
- Do not discuss with other candidates

## Questions?

If you have any questions or need clarification on the requirements, please reach out to the team anytime. We're happy to help!

## Submission

1. Create a **private** repository on your GitHub account
2. Push your complete source code with all changes
3. Grant access to the team members we specify

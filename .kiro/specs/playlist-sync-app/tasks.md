# Implementation Plan: Playlist Sync App

## Overview

This implementation plan breaks down the Playlist Sync App into discrete coding tasks. The app enables users to synchronize music playlists across Spotify, Amazon Music, and YouTube Music with three sync modes (one-time copy, bidirectional sync, one-way sync), intelligent ISRC-first song matching with metadata fallback, comprehensive error handling, and automatic scheduling.

The implementation follows an incremental approach: set up infrastructure, implement core services, build sync engine, create UI components, add testing, and integrate monitoring.

## Tasks

- [ ] 1. Project setup and infrastructure
  - [ ] 1.1 Set up Convex schema and database
    - Define schema for users, serviceConnections, cachedPlaylists, syncConfigurations, syncJobs, syncErrors, matchCache tables
    - Create database indexes for performance (by_user_and_service, by_config, by_job, etc.)
    - Configure Convex functions directory structure
    - _Requirements: 1.5, 2.1, 3.1, 4.1, 5.1, 10.1, 13.1, 17.5, 18.1_
  
  - [ ] 1.2 Configure Clerk authentication
    - Set up Clerk application with OAuth providers (Spotify, Amazon Music, YouTube Music)
    - Configure Clerk middleware in Tanstack Start
    - Create user sync between Clerk and Convex
    - _Requirements: 1.1, 1.2, 1.3, 18.2_
  
  - [ ] 1.3 Set up Sentry and PostHog
    - Configure Sentry for error tracking with source maps
    - Configure PostHog for analytics
    - Add error boundary components
    - _Requirements: 15.5, 16.1, 16.2_

- [ ] 2. Service connector implementation
  - [ ] 2.1 Create ServiceConnector interface and base types
    - Define TypeScript interfaces for ServiceConnector, AuthResult, Playlist, Track, SearchQuery, TrackMatch
    - Create shared types for MusicService enum
    - _Requirements: 1.1, 1.2, 1.3, 2.1_
  
  - [ ] 2.2 Implement Spotify connector
    - Implement OAuth flow with Spotify API
    - Implement getPlaylists, getPlaylistTracks, addTracksToPlaylist, removeTracksFromPlaylist
    - Implement searchTrack and searchByISRC methods
    - Handle token refresh and expiration
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 6.1, 6.2_
  
  - [ ] 2.3 Implement Amazon Music connector
    - Implement OAuth flow with Amazon Music API
    - Implement all ServiceConnector interface methods
    - Handle token refresh and expiration
    - _Requirements: 1.2, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2_
  
  - [ ] 2.4 Implement YouTube Music connector
    - Implement OAuth flow with YouTube Music API
    - Implement all ServiceConnector interface methods
    - Handle token refresh and expiration
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2_
  
  - [ ]* 2.5 Write unit tests for service connectors
    - Test authentication flows with mocked OAuth responses
    - Test playlist operations with mocked API responses
    - Test error handling and token refresh logic
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 15.1, 15.2, 15.3_

- [ ] 3. Song matching engine
  - [ ] 3.1 Implement string similarity algorithm
    - Implement Levenshtein distance calculation
    - Normalize scores to 0-100 scale
    - Create utility functions for text normalization (lowercase, remove special chars)
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 3.2 Write unit tests for string similarity
    - Test exact matches return 100
    - Test completely different strings return low scores
    - Test partial matches return appropriate scores
    - _Requirements: 6.4, 6.5_
  
  - [ ] 3.3 Implement SongMatcher component
    - Implement findMatch method with ISRC-first strategy
    - Implement calculateMetadataScore with weighted scoring (title 50%, artist 35%, album 15%)
    - Implement confidence thresholds (≥95% high, 70-94% medium, <70% low)
    - Implement explicit/clean version prioritization
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 7.1, 7.2, 7.3_
  
  - [ ]* 3.4 Write unit tests for SongMatcher
    - Test ISRC matching takes priority over metadata
    - Test metadata scoring with various similarity levels
    - Test confidence threshold classification
    - Test explicit/clean version prioritization
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7, 6.8, 6.9, 6.10, 7.1, 7.2_
  
  - [ ] 3.5 Implement match caching in Convex
    - Create Convex mutation to store match results
    - Create Convex query to retrieve cached matches
    - Implement 7-day expiration logic
    - _Requirements: 17.5_
  
  - [ ]* 3.6 Write unit tests for match caching
    - Test cache hit returns cached result
    - Test cache miss triggers new search
    - Test expired cache entries are ignored
    - _Requirements: 17.5_

- [ ] 4. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Sync engine implementation
  - [ ] 5.1 Implement change detection for bidirectional sync
    - Create detectChanges method to compare current playlist state with last sync snapshot
    - Detect added tracks by comparing track IDs
    - Detect removed tracks by comparing track IDs
    - Store playlist snapshots in Convex after each sync
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 5.2 Implement change detection for one-way sync
    - Create detectChanges method for source playlist only
    - Ignore changes in target playlists
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ] 5.3 Implement SyncEngine core logic
    - Implement executeSync method to orchestrate sync process
    - Implement applyChanges method to add/remove tracks from playlists
    - Handle batch processing for large playlists (>500 tracks)
    - Preserve song order during sync operations
    - _Requirements: 3.2, 3.3, 3.4, 4.4, 4.5, 4.6, 5.3, 17.3_
  
  - [ ] 5.4 Implement error handling and retry logic
    - Handle rate limit errors with pause and retry
    - Handle server errors with exponential backoff (max 3 retries)
    - Handle service unavailability with failure notification
    - Create SyncError records for unmatched tracks
    - _Requirements: 8.1, 8.2, 15.1, 15.2, 15.3, 15.5_
  
  - [ ]* 5.5 Write unit tests for sync engine
    - Test one-time copy mode adds all tracks
    - Test bidirectional sync detects and applies changes
    - Test one-way sync ignores target changes
    - Test error handling and retry logic
    - Test batch processing for large playlists
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 15.1, 15.2, 15.3_

- [ ] 6. Convex functions for sync operations
  - [ ] 6.1 Create Convex mutations for sync configuration management
    - createSyncConfiguration mutation
    - updateSyncConfiguration mutation (edit mode, playlists, schedule)
    - deleteSyncConfiguration mutation
    - _Requirements: 3.1, 4.1, 5.1, 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ] 6.2 Create Convex queries for sync data retrieval
    - getSyncConfigurations query (all configs for user)
    - getSyncConfiguration query (single config by ID)
    - getSyncJobs query (history for config)
    - getSyncErrors query (unresolved errors for config)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 13.1, 13.4_
  
  - [ ] 6.3 Create Convex mutation for manual sync triggering
    - executeSyncJob mutation to trigger immediate sync
    - Create SyncJob record with status 'running'
    - Call SyncEngine.executeSync
    - Update SyncJob record with results
    - _Requirements: 12.1, 12.2, 12.4_
  
  - [ ] 6.4 Create Convex scheduled function for automatic syncs
    - Create cron job handler to check for due syncs
    - Query syncConfigurations with schedule.nextRunAt <= now
    - Execute sync for each due configuration
    - Update nextRunAt based on frequency
    - Implement retry logic for failed syncs (max 3 attempts with exponential backoff)
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ] 6.5 Create Convex mutations for error resolution
    - resolveErrorWithManualMatch mutation (add selected track, mark error resolved)
    - skipError mutation (mark error as skipped)
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 7. Authentication and service connection UI
  - [ ] 7.1 Create service connection panel component
    - Display connection status for each music service
    - Add "Connect" buttons that trigger OAuth flow via Clerk
    - Add "Disconnect" buttons that revoke tokens
    - Show last connected timestamp
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 18.4_
  
  - [ ] 7.2 Implement OAuth callback handling
    - Create API route to handle OAuth callbacks
    - Store tokens in Convex serviceConnections table (encrypted)
    - Redirect user back to dashboard after successful connection
    - _Requirements: 1.4, 1.5, 18.1, 18.3_
  
  - [ ]* 7.3 Write Playwright tests for authentication flow
    - Test connecting a music service
    - Test disconnecting a music service
    - Test token refresh on expiration
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

- [ ] 8. Playlist browser and sync configuration UI
  - [ ] 8.1 Create playlist browser component
    - Fetch and display playlists grouped by service
    - Show playlist name, track count, and service icon
    - Add refresh button to fetch latest playlists
    - Add search/filter functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 8.2 Create sync configuration form component
    - Add source playlist selection (single or multiple based on mode)
    - Add target playlist selection (multiple)
    - Add sync mode selector (one-time copy, bidirectional, one-way)
    - Add schedule configuration (enable/disable, frequency)
    - Add form validation
    - _Requirements: 3.1, 4.1, 5.1, 11.1, 11.2_
  
  - [ ] 8.3 Implement sync configuration creation flow
    - Submit form data to createSyncConfiguration mutation
    - Show success message and redirect to dashboard
    - Handle validation errors
    - _Requirements: 3.1, 4.1, 5.1_
  
  - [ ]* 8.4 Write Playwright tests for sync configuration
    - Test creating one-time copy configuration
    - Test creating bidirectional sync configuration
    - Test creating one-way sync configuration
    - Test form validation
    - _Requirements: 3.1, 4.1, 5.1_

- [ ] 9. Sync dashboard and monitoring UI
  - [ ] 9.1 Create sync dashboard component
    - Display all sync configurations in cards/table
    - Show sync mode, last sync time, error count, success count for each config
    - Add warning indicator for configs with unresolved errors
    - Add "Sync Now" button for manual triggering
    - Add "Edit" and "Delete" buttons for config management
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.1_
  
  - [ ] 9.2 Implement real-time sync progress indicator
    - Subscribe to Convex syncJobs table for real-time updates
    - Display progress bar with track counts during sync
    - Show completion summary when sync finishes
    - _Requirements: 12.2, 12.3, 12.4_
  
  - [ ] 9.3 Create sync history view component
    - Display list of past sync jobs for selected configuration
    - Show timestamp, duration, tracks added/removed, error count
    - Add filter by date range
    - Add pagination for large history
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 9.4 Write Playwright tests for dashboard
    - Test dashboard displays all sync configurations
    - Test manual sync triggering
    - Test real-time progress updates
    - Test viewing sync history
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 12.1, 12.2, 12.3, 12.4, 13.4_

- [ ] 10. Checkpoint - UI and sync flow complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Error resolution UI
  - [ ] 11.1 Create error list component
    - Display all unresolved sync errors for a configuration
    - Show source track details (title, artist, album, explicit status)
    - Show error type and reason
    - Add "Resolve" button for each error
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [ ] 11.2 Create error resolution modal component
    - Display source track information prominently
    - Display candidate matches with confidence scores
    - Add search input to find alternative tracks
    - Add "Select" button for each candidate
    - Add "Skip" button to skip the track
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 11.3 Implement manual match selection
    - Call resolveErrorWithManualMatch mutation when user selects a track
    - Add selected track to target playlist via service connector
    - Update error status to 'resolved'
    - Show success message
    - _Requirements: 9.3, 9.4_
  
  - [ ] 11.4 Implement error skipping
    - Call skipError mutation when user clicks skip
    - Update error status to 'skipped'
    - Remove error from unresolved list
    - _Requirements: 9.5_
  
  - [ ]* 11.5 Write Playwright tests for error resolution
    - Test viewing error list
    - Test opening error resolution modal
    - Test selecting manual match
    - Test skipping error
    - Test searching for alternative tracks
    - _Requirements: 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Notifications and user feedback
  - [ ] 12.1 Implement in-app notification system
    - Create notification component with toast/banner UI
    - Show notification when sync completes with errors
    - Show notification when sync fails completely
    - Add notification badge showing total unresolved error count
    - _Requirements: 16.1, 16.2, 16.4_
  
  - [ ] 12.2 Add notification preferences
    - Create settings UI for notification preferences
    - Add toggle for successful sync notifications
    - Store preferences in Convex user settings
    - _Requirements: 16.3_
  
  - [ ]* 12.3 Write unit tests for notification system
    - Test notification appears on sync error
    - Test notification appears on sync failure
    - Test notification badge updates with error count
    - Test notification preferences are respected
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ] 13. Performance optimization
  - [ ] 13.1 Implement batch processing for large playlists
    - Process tracks in batches of 50 for playlists >500 tracks
    - Update progress indicator after each batch
    - Add delay between batches to respect rate limits
    - _Requirements: 17.3_
  
  - [ ] 13.2 Implement match result caching
    - Check cache before performing new search
    - Store successful matches in cache with 7-day expiration
    - Use cache for repeated syncs of same playlists
    - _Requirements: 17.5_
  
  - [ ] 13.3 Optimize database queries with indexes
    - Verify all Convex indexes are created correctly
    - Add compound indexes for common query patterns
    - Test query performance with large datasets
    - _Requirements: 17.1, 17.2, 17.4_
  
  - [ ]* 13.4 Write performance tests
    - Test sync completes within 30s for <100 tracks
    - Test sync completes within 2min for 100-500 tracks
    - Test batch processing for >500 tracks
    - Test cache improves repeat sync performance
    - _Requirements: 17.1, 17.2, 17.3, 17.5_

- [ ] 14. Security and data privacy
  - [ ] 14.1 Implement token encryption
    - Use Convex built-in encryption for sensitive fields
    - Encrypt accessToken and refreshToken in serviceConnections table
    - Ensure tokens are never logged or exposed in errors
    - _Requirements: 18.1, 18.3_
  
  - [ ] 14.2 Implement HTTPS enforcement
    - Configure Netlify to enforce HTTPS
    - Set secure cookie flags for Clerk sessions
    - Add HSTS headers
    - _Requirements: 18.2_
  
  - [ ] 14.3 Implement token cleanup on disconnect
    - Delete serviceConnection record when user disconnects
    - Revoke OAuth tokens with music service APIs
    - _Requirements: 18.4_
  
  - [ ]* 14.4 Write security tests
    - Test tokens are encrypted at rest
    - Test tokens are not exposed in API responses
    - Test token cleanup on disconnect
    - Test HTTPS enforcement
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 15. Integration and deployment
  - [ ] 15.1 Configure Netlify deployment
    - Create netlify.toml with build configuration
    - Set up environment variables for Convex, Clerk, Sentry, PostHog
    - Configure redirects and headers
    - _Requirements: Foundation for all requirements_
  
  - [ ] 15.2 Set up CI/CD pipeline
    - Configure GitHub Actions for automated testing
    - Run Vitest unit tests on PR
    - Run Playwright E2E tests on PR
    - Deploy to Netlify on merge to main
    - _Requirements: Foundation for all requirements_
  
  - [ ]* 15.3 Write end-to-end integration tests
    - Test complete sync flow from configuration to completion
    - Test error resolution flow
    - Test automatic scheduled sync
    - Test multi-service sync
    - _Requirements: All requirements_
  
  - [ ] 15.4 Create deployment documentation
    - Document environment variable setup
    - Document OAuth app configuration for each service
    - Document Convex deployment process
    - Document monitoring and alerting setup
    - _Requirements: Foundation for all requirements_

- [ ] 16. Final checkpoint - Complete application
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- The implementation follows a bottom-up approach: infrastructure → services → engine → UI
- Testing tasks are integrated throughout to catch issues early
- Security and performance are addressed as dedicated tasks before deployment

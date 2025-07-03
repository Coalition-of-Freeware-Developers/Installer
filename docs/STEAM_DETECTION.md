# Steam X-Plane 12 Auto-Detection

## Overview

The Coalition Installer now includes automatic detection of X-Plane 12 installations, including Steam versions, using the `steam-locate` package. This reduces the need for users to manually locate their X-Plane installation directory.

## Features

### 1. Steam Detection via steam-locate Package
- Uses the `steam-locate@1.0.3` npm package to find Steam installations
- Automatically locates Steam library folders
- Searches for X-Plane 12 in all Steam library locations
- Validates installations by checking for `X-Plane.exe`

### 2. Fallback Detection
- If Steam detection fails, falls back to checking common installation paths
- Includes standard and Steam installation directories
- Covers multiple drive letters for custom Steam libraries

### 3. Automatic Setup on Startup
- Runs detection automatically when the application starts
- Only triggers if no valid X-Plane path is already configured
- Automatically configures all related directory paths when found

## Implementation Details

### Main Process (Node.js side)
- **File**: `src/main/SteamDetection.ts`
- **Method**: `SteamDetectionMain.findXPlane12()`
- Uses steam-locate package to find Steam installations
- Searches Steam library folders for X-Plane 12
- Validates installations by checking for executable files

### Renderer Process (UI side)
- **File**: `src/renderer/utils/SteamDetection.ts`
- **Method**: `SteamDetection.detectSteamXPlane12()`
- Communicates with main process via IPC
- Falls back to manual path checking if steam-locate fails

### Auto-Detection Utility
- **File**: `src/renderer/utils/AutoDetection.ts`
- **Method**: `AutoDetection.detectXPlaneOnStartup()`
- Orchestrates the complete detection process
- Automatically configures all X-Plane directories when found
- Respects user preferences (skips if user set "not installed")

### Integration Points
1. **App Startup**: `src/renderer/components/App/index.tsx`
   - Runs auto-detection during app initialization
   
2. **Error Modal**: `src/renderer/components/ErrorModal/index.tsx`
   - Attempts auto-detection when path validation fails
   
3. **Path Setup**: `src/renderer/actions/install-path.utils.tsx`
   - Enhanced manual path selection with Steam detection

## User Experience

### On Fresh Install
1. User opens the installer for the first time
2. Auto-detection runs in the background
3. If X-Plane 12 (Steam or standard) is found:
   - All paths are automatically configured
   - User can immediately use the installer
4. If not found:
   - User is prompted to manually select the path (existing behavior)

### Detection Priority
1. **Existing Valid Path**: Uses already configured path if valid
2. **Steam Detection**: Uses steam-locate to find Steam installations
3. **Standard Paths**: Checks common installation directories
4. **Manual Selection**: Falls back to user selection if nothing found

### Steam Detection Advantages
- **Comprehensive**: Finds installations in any Steam library folder
- **Accurate**: Uses Steam's own configuration files
- **Cross-library**: Works with Steam libraries on different drives
- **Reliable**: Less prone to errors than path guessing

## Error Handling

### Steam-locate Failures
- Package import errors are caught and logged
- Falls back to manual path checking
- Does not interrupt the application flow

### Path Validation
- All detected paths are validated before use
- Checks for X-Plane.exe existence
- Ensures directory accessibility

### User Control
- Users can still manually override detected paths
- "Not installed" option still available
- All existing manual configuration options remain

## Technical Notes

### IPC Communication
- Steam detection uses IPC channel: `steam:findXPlane12`
- Main process handles steam-locate package usage
- Renderer process receives results via async IPC

### Performance
- Auto-detection runs only once on startup
- Cached results prevent repeated scanning
- Non-blocking implementation with proper error handling

### Compatibility
- Works with all Steam library configurations
- Supports custom Steam library locations
- Compatible with both Steam and non-Steam installations

## Development

### Testing Steam Detection
```bash
# Build the application
npm run build

# Run the application
npm start
```

### Debugging
- Check console logs for detection attempts
- Steam detection logs are prefixed with `[SteamDetectionMain]`
- Auto-detection logs are prefixed with `[AutoDetection]`

### Adding New Detection Methods
1. Extend `AutoDetection.detectXPlaneOnStartup()`
2. Add new detection logic before standard path checking
3. Ensure proper error handling and logging

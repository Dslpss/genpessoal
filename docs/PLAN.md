# PLAN: Multi-Page Dashboard Implementation

## Overview
Transform the current single-view dashboard into a multi-page experience with dedicated modules for History, Statistics, and Settings.

## Phase 1: Infrastructure & Navigation
- **Navigation State**: Implement `activeView` state in `App.jsx`.
- **Component Routing**: Create a dispatcher to render the correct view based on state.
- **Sidebar Integration**: Connect sidebar buttons to the navigation state.

## Phase 2: Feature Modules

### 2.1 "Minhas Compras" (Purchases History)
- **Component**: `PurchasesHistory.jsx`
- **Features**: 
  - Table/Grid view of all past `shopping_sessions`.
  - Search bar to filter by title.
  - Delete functionality with confirmation.
  - "Resumo" card for each session (Totals).

### 2.2 "Estatísticas" (Visual Analytics)
- **Component**: `Analytics.jsx`
- **Features**:
  - Horizontal bar charts for spending by category (Shared vs Personal).
  - Time-series trend (Spending over time).
  - "Savings" total (Total others owe).
  - Uses `framer-motion` for animated data bars.

### 2.3 "Configurações" (User Settings)
- **Component**: `Settings.jsx`
- **Features**:
  - Profile summary (Email, UID).
  - Theme Color Picker (Change primary emerald to other colors).
  - Currency display toggle (Mock).

## Phase 3: Verification
- **Audit**: Run `security_scan.py`.
- **Validation**: Ensure all navigation states handle empty data gracefully.
- **Responsive Check**: Verify charts on mobile screens.

## Agents Involved
1. **project-planner**: Planning and Architecture.
2. **frontend-specialist**: UI implementation and Animations.
3. **backend-specialist**: Data fetching logic and session syncing.
4. **test-engineer**: Verification and Bug fixes.

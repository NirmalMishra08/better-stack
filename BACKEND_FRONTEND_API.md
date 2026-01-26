# Backend ↔ Frontend API Mapping

## ✅ Implemented and linked

### Auth (`/v1/auth`)
| Method | Backend Route | Frontend API | Used In |
|--------|----------------|--------------|---------|
| POST | `/auth/login` | `authAPI.login(token, userData)` | Login page, auth.ts |
| GET | `/auth/user-details` | `authAPI.getUserDetails()` | (available for profile/settings) |

### Monitor (`/v1/monitor`)
| Method | Backend Route | Frontend API | Used In |
|--------|----------------|--------------|---------|
| POST | `/monitor/create-monitor` | `monitorAPI.createMonitor(data)` | Dashboard – Create Monitor modal |
| GET | `/monitor/get-all-monitors` | `monitorAPI.getAllMonitors()` | Dashboard overview, Monitors page |
| GET | `/monitor/get-active-monitors` | `monitorAPI.getActiveMonitors()` | (available) |
| GET | `/monitor/get-monitor/{id}` | `monitorAPI.getMonitorById(id)` | (available for detail page) |
| GET | `/monitor/monitors/{id}/metrics` | `monitorAPI.getMonitorStatus(id)` | (available for detail/stats) |
| GET | `/monitor/monitor/{id}/logs` | `monitorAPI.getMonitorLogs(id, options)` | (available for logs) |
| POST | `/monitor/toggle-monitor` | `monitorAPI.toggleMonitor(id, isActive)` | Monitors page |
| DELETE | `/monitor/delete-monitor/{id}` | `monitorAPI.deleteMonitor(id)` | (available) |

---

## ❌ Not implemented in backend (Alert APIs)

The backend has an **alert** package (`backend/internal/api/alert/`) but **no alert routes are defined** in the handler. The alert handler’s `Routes()` has an empty authenticated group, so there are no alert endpoints to call.

To support an Alerts page or alert management you would need to add backend endpoints, for example:

- `GET /v1/alert/recent` – recent alerts for the user  
- `GET /v1/alert/contacts` – alert contacts  
- `POST /v1/alert/contacts` – create alert contact  
- (and any others you need)

Until these are implemented, the frontend **Alerts** page has no backend to link to and should keep using mock/local data or be hidden.

---

## Summary

- **Auth:** 2/2 endpoints implemented and linked.  
- **Monitor:** 8/8 endpoints implemented and linked; Dashboard and Monitors page use `getAllMonitors`, create, and toggle.  
- **Alert:** 0 endpoints; backend alert API not implemented.

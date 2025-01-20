# Analytics

## Overview

The `analytics` feature provides an easy-to-integrate analytics system for tracking visitor activity on your website. It records visitor data (IP address, referer, timestamp) and presents the information in a graphical dashboard. The system is powered by an SQLite database, ensuring fast and reliable data storage. Access to the dashboard is protected by basic authentication.

Once enabled, the analytics feature automatically aggregates and visualizes the data, making it simple to monitor traffic patterns over time.

## How to Activate the Analytics Feature

To enable the analytics feature, configure it when setting up your server. In your server configuration file (e.g., `server.config.ts`), add the following settings:

```ts
import { createServer } from './.sweyn/index.ts'

createServer({
  analytics: true,
  admin: {
    login: 'admin',       // Admin username
    password: 'p4ssw0rd', // Admin password
  },
})
```

- `analytics`: Set this option to `true` to enable the analytics tracking and dashboard.
- `admin`: This object contains the credentials required for logging into the analytics dashboard:
  - `login`: The username for authentication.
  - `password`: The password for authentication.

## Accessing the Analytics Dashboard

Once the analytics feature is enabled and the server is running, you can access the analytics dashboard by navigating to the following URL:

```bash
https://my-domain.com/analytics
```

You will be prompted to enter the admin credentials (`login` and `password`) you configured in the server setup.

### Authentication

The `/analytics` route is protected by basic HTTP authentication. Only users with the correct username and password (set in your `server.config.ts`) will be able to view the analytics page.

## Powered by SQLite

The analytics system is backed by an SQLite database (`analytics.db`), which stores all visitor data. Each visitor's IP address, referer, and timestamp are recorded in the database when they visit the site. This makes it easy to query and aggregate data over various time periods for visualization.

### Database Structure

The SQLite database contains a single table, `visitor`, with the following columns:
- **id** (INTEGER PRIMARY KEY AUTOINCREMENT): Unique identifier for each record.
- **created_at** (DATE): The timestamp when the visitor was recorded.
- **ip** (STRING): The IP address of the visitor.
- **referer** (STRING): The referer header (the previous page the visitor came from).

The data is queried from the database for visualization purposes and automatically grouped by time periods (e.g., hourly, daily) and resolution.

## Graphical User Interface (UI)

The analytics dashboard provides a graphical representation of visitor data over time. The UI is automatically populated with data from the last 365 days (by default). The dashboard visualizes the following:

1. **Visit Counts**: Displays the number of visits per time period (e.g., daily).
2. **Data Bars**: For each time period, the number of visits is represented as a data bar, allowing you to visually compare activity across different periods.
3. **Date Range and Resolution**: The data can be grouped by different time resolutions (e.g., "1 hour", "1 day", etc.), with a configurable time range (e.g., the past 1 day, week, month, or year).

## Visitor Data Recording

The analytics feature automatically tracks the following information for each visitor:
- **IP Address**: The IP address of the visitor.
- **Referer**: The referring URL (i.e., the page the visitor came from).
- **Timestamp**: The exact time when the visit occurred.

This data is recorded automatically each time a visitor accesses any route other than `/analytics`, and only if the visitor is not a bot (based on their user agent).

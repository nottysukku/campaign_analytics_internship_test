DROP TABLE IF EXISTS campaigns;

CREATE TABLE campaigns (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Active', 'Paused')),
    clicks INTEGER NOT NULL,
    cost REAL NOT NULL,
    impressions INTEGER NOT NULL
);

INSERT INTO campaigns (id, name, status, clicks, cost, impressions) VALUES
    (1, 'Summer Sale', 'Active', 150, 45.99, 1000),
    (2, 'Black Friday', 'Paused', 320, 89.50, 2500),
    (3, 'Spring Launch', 'Active', 210, 54.10, 1800),
    (4, 'Holiday Blitz', 'Active', 540, 132.75, 5000),
    (5, 'Clearance', 'Paused', 95, 21.40, 900),
    (6, 'New Arrivals', 'Active', 410, 101.20, 3600),
    (7, 'Referral Push', 'Active', 88, 19.99, 700),
    (8, 'Back to School', 'Paused', 275, 73.25, 2400),
    (9, 'VIP Upsell', 'Active', 160, 62.35, 1200),
    (10, 'Reactivation', 'Paused', 130, 28.65, 1100);

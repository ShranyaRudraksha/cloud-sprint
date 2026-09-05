-- CloudSprint database schema
-- Run once against a fresh database, e.g.:
--   docker exec -i cloudsprint-db psql -U postgres -d cloudsprint < schema.sql

CREATE TABLE organizations (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    org_id        INTEGER NOT NULL REFERENCES organizations(id),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'requester',
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE requests (
    id              SERIAL PRIMARY KEY,
    requester_name  VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(50) NOT NULL,
    parameters      JSONB NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    user_id         INTEGER REFERENCES users(id),
    org_id          INTEGER REFERENCES organizations(id),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE approvals (
    id            SERIAL PRIMARY KEY,
    request_id    INTEGER NOT NULL REFERENCES requests(id),
    approver_name VARCHAR(100) NOT NULL,
    decision      VARCHAR(20) NOT NULL,
    remarks       TEXT,
    decided_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE inventory (
    id                SERIAL PRIMARY KEY,
    request_id        INTEGER NOT NULL REFERENCES requests(id),
    resource_id       VARCHAR(100),
    resource_details  JSONB,
    status            VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
    id          SERIAL PRIMARY KEY,
    request_id  INTEGER REFERENCES requests(id),
    action      VARCHAR(50) NOT NULL,
    actor       VARCHAR(100) NOT NULL,
    details     TEXT,
    logged_at   TIMESTAMP NOT NULL DEFAULT now()
);

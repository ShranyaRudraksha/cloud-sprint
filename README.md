# CloudSprint

A self-service AWS provisioning portal. A requester submits a request for
an EC2 instance, S3 bucket, or IAM user; an org admin approves it; the
backend then runs Terraform against the config in this repo to actually
create the resource in AWS.

```
.
├── ec2.tf, s3.tf, iam.tf, vpc.tf, ...   # Terraform config (root module)
├── cloudsprint-backend/                 # Express API + Postgres
└── cloudsprint-frontend/                # React (Vite) UI
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Postgres)
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- An AWS account with credentials configured locally (`aws configure`, or
  `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` env vars) — the backend shells
  out to the AWS CLI's credential chain via Terraform, so whatever `terraform
  plan` normally uses will work here too.
- An existing EC2 key pair in your target AWS region (for `key_name` below).

## 1. Clone and install dependencies

```bash
git clone https://github.com/ShranyaRudraksha/cloud-sprint.git
cd cloud-sprint

cd cloudsprint-backend && npm install && cd ..
cd cloudsprint-frontend && npm install && cd ..
```

## 2. Configure Terraform

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and fill in real values — at minimum `ami_id` (an
Amazon Linux 2023 AMI for your region), `key_name` (your EC2 key pair), and
`bucket_name` (must be globally unique).

Then initialize the working directory (downloads the AWS provider):

```bash
terraform init
```

> `terraform.tfvars`, `terraform.tfstate*`, and `.terraform/` are gitignored
> on purpose — they're environment-specific and can contain resource
> details. Never commit them.

## 3. Start Postgres

```bash
docker compose up -d db
```

This starts a `postgres:16` container (`cloudsprint-db`) on port 5432 with
an empty database named `cloudsprint`. To use a non-default password, set
`POSTGRES_PASSWORD` in your shell before running the command above (it
defaults to `changeme` otherwise) — just make sure it matches `DB_PASSWORD`
in the backend `.env` you set up next.

Load the schema (one-time, only needed the first time the volume is created):

```bash
docker exec -i cloudsprint-db psql -U postgres -d cloudsprint < cloudsprint-backend/schema.sql
```

## 4. Configure and run the backend

```bash
cd cloudsprint-backend
cp .env.example .env
```

Edit `.env`:
- `DB_PASSWORD` — must match the Postgres password from step 3
- `TERRAFORM_DIR` — the **absolute path** to the repo root (where the
  `.tf` files live), e.g. `/home/you/cloud-sprint` or
  `C:\Users\you\cloud-sprint`
- `JWT_SECRET` — any random string, used to sign auth tokens

Then start it:

```bash
npm run dev
```

It listens on `http://localhost:4000` by default. Confirm it's up:

```bash
curl http://localhost:4000/health
```

## 5. Configure and run the frontend

```bash
cd cloudsprint-frontend
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Using the app

1. **Register.** The first person to register with a given organization
   name becomes that org's **admin**; everyone who joins the same
   organization afterward is a **requester**.
2. As a requester, submit a request from **New Request**. It's created
   with status `pending` — nothing is provisioned yet.
3. Log in as the admin and go to **Requests**. Approve (or reject) the
   pending request. On approval, the backend runs `terraform apply`
   targeting just that resource type, and the request moves to `active`
   once it succeeds.
4. Either the admin or the original requester can **Teardown** an active
   resource, which runs `terraform destroy` for it.

## Notes / gotchas

- Every resource type maps to a **single, fixed** Terraform resource
  address (e.g. all EC2 requests target `aws_instance.app_server`).
  Approving a second EC2 request reconfigures the same instance rather
  than creating a new one — this is a real limitation of the current
  design, not a bug in setup.
- If Postgres and/or Docker restart, re-run `docker compose up -d db`
  before starting the backend — otherwise it'll fail to connect.
- Pushing to GitHub? `.gitignore` already excludes `.env`, `*.pem`,
  `terraform.tfvars`, and `terraform.tfstate*`. Double-check
  `git status` before committing if you've added new files with
  credentials in them.

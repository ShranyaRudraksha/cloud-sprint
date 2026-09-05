// src/services/terraformService.js
const { spawn } = require("child_process");
require("dotenv").config();
console.log("TERRAFORM_DIR is:", JSON.stringify(process.env.TERRAFORM_DIR));

const logStore = require("./logStore");

const TF_DIR = process.env.TERRAFORM_DIR;

// Which Terraform resources to target, per catalog item
const RESOURCE_TARGETS = {
  ec2: ["aws_instance.app_server", "aws_security_group.basic_sg"],
  s3: ["aws_s3_bucket.app_bucket", "aws_s3_bucket_versioning.app_bucket_versioning", "aws_s3_bucket_public_access_block.app_bucket_block"],
  iam: ["aws_iam_user.app_user", "aws_iam_user_policy_attachment.app_user_policy"],
  vpc: ["aws_vpc.app_vpc", "aws_subnet.app_subnet", "aws_internet_gateway.app_igw", "aws_route_table.app_rt", "aws_route_table_association.app_rta"],
};

// Which request parameters are allowed to override terraform.tfvars, per type
const ALLOWED_VARS = {
  ec2: ["instance_type", "ami_id", "key_name"],
  s3: ["bucket_name"],
  iam: ["iam_user_name", "iam_policy_arn"],
  vpc: ["vpc_cidr", "subnet_cidr", "availability_zone"],
};

// Which terraform outputs matter, per type
const RELEVANT_OUTPUTS = {
  ec2: ["ec2_instance_id", "ec2_public_ip"],
  s3: ["s3_bucket_name"],
  iam: ["iam_user_name", "iam_user_arn"],
  vpc: ["vpc_id", "subnet_id"],
};

function buildArgs(action, resource_type, parameters) {
  const targets = RESOURCE_TARGETS[resource_type];
  if (!targets) throw new Error(`Unknown resource_type: ${resource_type}`);

  const args = [action, "-auto-approve", "-no-color"];
  targets.forEach(t => args.push(`-target=${t}`));

  (ALLOWED_VARS[resource_type] || [])
    .filter(key => parameters[key] !== undefined)
    .forEach(key => args.push("-var", `${key}=${parameters[key]}`));

  return args;
}

// Runs `terraform <args>` with output streamed line-by-line into logStore
// for the given request, so the UI can show live progress.
function runTerraform(requestId, args) {
  return new Promise((resolve, reject) => {
    logStore.append(requestId, `$ terraform ${args.join(" ")}`);

    const proc = spawn("terraform", args, { cwd: TF_DIR });
    let stderrTail = "";

    const emitLines = (chunk) => {
      chunk
        .toString()
        .split(/\r?\n/)
        .forEach(line => { if (line.trim()) logStore.append(requestId, line); });
    };

    proc.stdout.on("data", emitLines);
    proc.stderr.on("data", (chunk) => {
      stderrTail = (stderrTail + chunk.toString()).slice(-2000);
      emitLines(chunk);
    });

    proc.on("error", (err) => {
      logStore.append(requestId, `Failed to start terraform: ${err.message}`);
      reject(err);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`terraform ${args[0]} exited with code ${code}${stderrTail ? `: ${stderrTail}` : ""}`));
      }
    });
  });
}

// Runs `terraform output -json` and returns the parsed result, without
// polluting the live console with raw JSON.
function getOutputsJson() {
  return new Promise((resolve, reject) => {
    const proc = spawn("terraform", ["output", "-json"], { cwd: TF_DIR });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (c) => { stdout += c; });
    proc.stderr.on("data", (c) => { stderr += c; });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve(JSON.parse(stdout));
      else reject(new Error(`terraform output failed: ${stderr}`));
    });
  });
}

async function provisionResource(request) {
  const { id: requestId, resource_type, parameters } = request;

  logStore.clear(requestId);
  logStore.append(requestId, `Provisioning ${resource_type} for request #${requestId}...`);

  const args = buildArgs("apply", resource_type, parameters);
  await runTerraform(requestId, args);

  logStore.append(requestId, "Reading resource outputs...");
  const outputs = await getOutputsJson();

  const details = {};
  for (const key of RELEVANT_OUTPUTS[resource_type] || []) {
    if (outputs[key]) details[key] = outputs[key].value;
  }

  const resourceId = details.ec2_instance_id || details.s3_bucket_name || details.iam_user_name || details.vpc_id || "unknown";
  logStore.append(requestId, `Done. Resource ID: ${resourceId}`);

  return { resource_id: resourceId, resource_details: details };
}

async function destroyResource(request) {
  const { id: requestId, resource_type, parameters } = request;

  logStore.clear(requestId);
  logStore.append(requestId, `Tearing down ${resource_type} for request #${requestId}...`);

  const args = buildArgs("destroy", resource_type, parameters);
  await runTerraform(requestId, args);

  logStore.append(requestId, "Done. Resource destroyed.");
  return { destroyed: true };
}

module.exports = { provisionResource, destroyResource, logStore };

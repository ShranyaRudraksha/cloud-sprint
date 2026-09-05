// src/services/terraformService.js
const util = require("util");
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
require("dotenv").config();
console.log("TERRAFORM_DIR is:", JSON.stringify(process.env.TERRAFORM_DIR));

const TF_DIR = process.env.TERRAFORM_DIR;

// Which Terraform resources to target, per catalog item
const RESOURCE_TARGETS = {
  ec2: ["aws_instance.app_server", "aws_security_group.basic_sg"],
  s3: ["aws_s3_bucket.app_bucket", "aws_s3_bucket_versioning.app_bucket_versioning", "aws_s3_bucket_public_access_block.app_bucket_block"],
  iam: ["aws_iam_user.app_user", "aws_iam_user_policy_attachment.app_user_policy"],
};

// Which request parameters are allowed to override terraform.tfvars, per type
const ALLOWED_VARS = {
  ec2: ["instance_type", "ami_id", "key_name"],
  s3: ["bucket_name"],
  iam: ["iam_user_name", "iam_policy_arn"],
};

// Which terraform outputs matter, per type
const RELEVANT_OUTPUTS = {
  ec2: ["ec2_instance_id", "ec2_public_ip"],
  s3: ["s3_bucket_name"],
  iam: ["iam_user_name", "iam_user_arn"],
};

async function provisionResource(request) {
  const { resource_type, parameters } = request;

  const targets = RESOURCE_TARGETS[resource_type];
  if (!targets) throw new Error(`Unknown resource_type: ${resource_type}`);

  const targetFlags = targets.map(t => `-target=${t}`).join(" ");

  const varFlags = (ALLOWED_VARS[resource_type] || [])
    .filter(key => parameters[key] !== undefined)
    .map(key => `-var "${key}=${parameters[key]}"`)
    .join(" ");

  const command = `terraform apply -auto-approve ${targetFlags} ${varFlags}`;

  console.log(`[terraformService] Running: ${command}`);
  await execPromise(command, { cwd: TF_DIR, maxBuffer: 1024 * 1024 * 10 });

  const { stdout } = await execPromise("terraform output -json", { cwd: TF_DIR });
  const outputs = JSON.parse(stdout);

  const details = {};
  for (const key of RELEVANT_OUTPUTS[resource_type] || []) {
    if (outputs[key]) details[key] = outputs[key].value;
  }

  const resourceId = details.ec2_instance_id || details.s3_bucket_name || details.iam_user_name || "unknown";

  return { resource_id: resourceId, resource_details: details };
}

// Add to src/services/terraformService.js, below provisionResource

async function destroyResource(request) {
  const { resource_type, parameters } = request;

  const targets = RESOURCE_TARGETS[resource_type];
  if (!targets) throw new Error(`Unknown resource_type: ${resource_type}`);

  const targetFlags = targets.map(t => `-target=${t}`).join(" ");

  const varFlags = (ALLOWED_VARS[resource_type] || [])
    .filter(key => parameters[key] !== undefined)
    .map(key => `-var "${key}=${parameters[key]}"`)
    .join(" ");

  const command = `terraform destroy -auto-approve ${targetFlags} ${varFlags}`;

  console.log(`[terraformService] Running: ${command}`);
  await execPromise(command, { cwd: TF_DIR, maxBuffer: 1024 * 1024 * 10 });

  return { destroyed: true };
}

module.exports = { provisionResource, destroyResource };


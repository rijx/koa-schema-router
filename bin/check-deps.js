const fs = require("fs");

const packageDefinition = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));

function filterNonExistDependencies(dependencies) {
  if (dependencies == null) {
    return [];
  }

  const results = [];

  for (const name in dependencies) {
    const version = dependencies[name];

    if (version.startsWith("^")) {
      results.push({ name, version });
    }
  }

  return results;
}

const results = [
  ...filterNonExistDependencies(packageDefinition.dependencies),
  ...filterNonExistDependencies(packageDefinition.devDependencies)
];

if (results.length != 0) {
  for (const item of results) {
    process.stderr.write(
      `${item.name} has no locked version: ${item.version}\n`
    );
  }

  process.exit(1);
}

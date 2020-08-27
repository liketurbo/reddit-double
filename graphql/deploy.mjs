import readline from "readline";
import childProcess from "child_process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("What version should be? ", (version) => {
  let output = childProcess.execSync(
    `docker build . -t liketurbo/reddit-double:${version}`,
    { encoding: "utf-8" }
  );

  console.log(output);

  output = childProcess.execSync(
    `docker push liketurbo/reddit-double:${version}`,
    { encoding: "utf-8" }
  );

  console.log(output);

  output = childProcess.execSync(
    `ssh root@164.90.177.77 "docker pull liketurbo/reddit-double:${version} && docker tag liketurbo/reddit-double:${version} dokku/graphql:${version} && dokku deploy graphql ${version}"`,
    { encoding: "utf-8" }
  );

  console.log(output);

  rl.close();
});

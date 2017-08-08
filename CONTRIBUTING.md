# Contributing

Thanks for being willing to contribute!

## Project setup

You're going to need [`git`](https://git-scm.com/) to get the project, and [`node`](https://nodejs.org/en/) and
[`yarn`](https://yarnpkg.com/) to install dependencies and run scripts.

1. Fork and clone the repo
2. Run `yarn` to install dependencies
3. Run `yarn run validate` to validate you've got everything working
4. Create a branch for your PR
5. For testing, you may wish to link your local `actions-ai-app` within your package.json (E.g. `"actions-ai-app": "file:../actions-ai-app"`)

## Committing and Pushing changes

This project uses [semantic-release](https://npmjs.com/package/semantic-release) to do automatic releases and generate a changelog based on the
commit history. So we follow [a convention](https://github.com/conventional-changelog-archived-repos/conventional-changelog-angular/blob/ed32559941719a130bb0327f886d6a32a8cbc2ba/convention.md) for commit messages. Please follow this convention for your
commit messages, or you may also utilize [commitizen](https://github.com/commitizen/cz-cli):

Once you are ready to commit the changes, please use the below commands

1. Run `git add <files to be comitted>` to stage changed files
2. Run `yarn run commit` to start commitzen to commit those files

... and follow the instruction of the interactive prompt.

Please note that this project also uses githooks (with [husky](https://github.com/typicode/husky)) to validate commit messages, as well as running unit tests before a commit may be made.

## Thank you!
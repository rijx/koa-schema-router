# Contributing guide

Are you ready to contribute to this project? Great! Let's make talk about some practices we use.

## Code

### Editor or IDE

We use [VSCode](https://code.visualstudio.com/) as our editor. It has many comforts of an IDE (in the form of plugins) but without the bloat. We know it's not 100% open source, but we accept the trade off.

You're free to use any code editor or IDE. However, if you're not using VSCode we might not know how to set up some plugins that will make your life as a developer much easier.

### Testing

You should always test your code. Always at least _try_ to write unit tests for your code. If you need to refactor your code to be able to write a consise unit test, then it will make your code better in all aspects.

If something is too hard to unit test then your code does too much. If there's no time for unit tests, then keep in mind you'll have to test it manually, because putting untested code into production will ruin everybody's day.

### Code formatting and linting

We use [Prettier](https://prettier.io/) to format code for you (and save you time) and we use [ESLint](https://eslint.org/) to help you find bugs before having to spend precious time debugging them.

For that reason our ESLint rules are fairly conservative. We value readability of code the most. Whether you're a junior or a senior: simple to read code will always create more robust solutions.

### Setting up Prettier and ESLint

First install a Prettier plugin in your editor or IDE of choice. If your editor or IDE does not have a plugin for Prettier then we (should have) created `npm run lint-fix` for you.

If you did install Prettier successfully then be sure to set it to format upon save.

Now it's time to install the ESLint plugin for your editor or IDE. ESLint will be your second pair of virtual eyes. It will underline things that look questionable. Like defining a variable and then never using it.

### Before committing

Your project should have Git hooks setup using Husky. If that's the case it will automatically run `npm run lint` for you.

If that's not the case you will have to run `npm run lint` yourself (or propose using Husky).

### Dependencies

We welcome packages. Yes, "less is more", but so is "do not reinvent the wheel". We trust you to make a good judgement whether a package is reliable, battle-tested and thus worth adding.

The Unix philosophy "do one thing and do it well" is very important to us though. So please do not use something like `underscore` or `lodash` only when it's really the best tool for the job.

When saving dependencies to `package.json` be sure to:

- make the version exact
- commit the `package-lock.json` and see if it does not completely rewrite the file (you might have the wrong npm version in that case)
- use `devDependencies` if it's only needed during development, build time or testing but not in production

## Git

### Messages

Here's some rules when creating Git commit messages:

- Please use full sentences in your commit messages.
- You can omit the full stop if it's only one sentence.
- Do not write excessively long commits (mention the title and reference number of an issue or merge request instead)
- Do not mindlessly squash your commits. Keep commits relatively short or at least narrow in scope so they're easy to review.

### Merging master into your branch

Don't do this.

### Rebasing your branch against master

Please do rebase your branch against master. It may take some trial and error to understand how to work your way through merge conflicts, but the outcome is worth it.

If you do not rebase your code you'll get awful arrow or diamond patterns in your Git history. Which makes following what actually was changed by who _terribly hard_.

### Rebasing your branch interactively

In case you don't know `git rebase -i master` yet: it's awesome.

It let's you:

- reorder (non-conflicting) commits
- change (poorly worded? ;-) commit messages
- squash commits together (or use "fixup" to amend the commit before it)
- outright delete commits

This tool is very useful for keeping a neat and clear Git history. It's a lot more refined then just squashing everything when creating a merge request. If you have 20 commits, that should really be 2 commits, then add 18 "fixup" commands and you got an amazingly clean Git history.

### Work with multiple people on one branch

Try not to do this. If you take over the work from somebody else, then it's your branch. You could make this explicit by renaming the branch using `git checkout -b [new name]`.

If you're pair programming then preferably use a collaboration tool. We recommend [VS Live Share Extension Pack](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare-pack). It's in beta, but it lets you share your debug sessions and terminals as well. You have to be using VSCode though.

Exceptions are possible, but make well defined decisions about it. When you're working on the same branch you could easily break the branch by doing some well intended interactive rebasing.

### Branching off other branches

Don't do this. Cherry pick whatever you need and keep your branch synced against master.

### Splitting branches

When you feel like your branch is becoming to big of a change, you can split it into smaller features / merge requests.

Create a new feature branch like you'd always do (so branch it from master) and `git cherry-pick` your changes and submit it as a merge request.

### Looking through merge requests

If you're reviewing someone else's code please look at their changes per commit. This is how the author intended the code changes to be broken up and how the thought process should be.

If you look at the final diff of any non-trivial feature you'll be overwhelmed. If an enormous amount of changes is squashed into one commit you can rightfully complain about that.

Please _do_ suggest splitting code into multiple merge requests if they provide value to the project individually.

Keep in mind that what you put into a merge request has to be complete. It should not break the master or result in dead code that's waiting for it's bigger brother to be merged.

### Approving merge requests

Please keep these things in mind when reviewing somebody's merge request:

- Never mindlessly approve something because you're asked to do so.
- Leave comments on code you have questions about.
- If you've seen all the code, please leave a comment that you are done. The author knows he can expect your approval when he addresses the issues you pointed out.
- If you see that your peers have issues that have not been resolved yet, please do not approve the merge request yet. This will change in the future if we add an integration that adds all commenters as approvers.

As an author, please make sure that your reviewer is following above rules by not merging if you do not have approval from all commenters.

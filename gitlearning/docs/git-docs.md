1. Git basics — repository, commit, branch, HEAD, working directory, staging area
2. Daily commands — git clone, status, add, commit, log, diff
3. Branches — create, switch, merge, delete
4. Remote Git — push, pull, fetch, origin
5. Merge conflicts — how they happen and how to fix them
6. Undo mistakes — restore, reset, revert, reflog
7. Stash — temporarily save unfinished work
8. Rebase — simple explanation and when to use it
9. Git workflows — feature branches, pull requests, GitHub Flow, trunk-based development
10. DevOps/interview scenarios — Jenkins + Git, CI/CD triggers, common Git interview questions

Git is a version control system.
It tracks changes in your files over time.
Git keeps the history properly.
Git normally works through three important areas:


    git init          --> initializes a new Git repository in the current directory
      ↓
Working Directory     --> your current changes     --> Untracked files
      ↓
    git status        --> shows which files are modified, staged, or untracked
      ↓
    git add           --> moves selected files or all files 
      ↓
    git rm --cached   --> removes the selected file 
      ↓
    git restore --staged  --> restore the selected file
      ↓
    git diff          --> line-by-line changes Working Directory → Staging Area
      ↓
Staging Area          --> These are the changes I want to include in my next commit.done 
      ↓
    git diff --staged --> diff between Staging Area → Last Commit
    git diff --cached
      ↓
    git commit        --> creates a permanent snapshot of those staged changes
      ↓
local Repository
      ↓ 
    git push
      ↓ 
Remote Repository

git log --oneline
git log will give all commit information --> commit hash , author and also date when it got done


Git
= Version control tool
= Runs on your computer
= Tracks file changes

GitHub
= Website/platform
= Stores Git repositories online
= Helps teams collaborate

git status shows which files are modified, staged, or untracked. 
git diff shows the actual line-by-line changes.

That .git directory contains information about:
-- commits
-- branches
-- history
-- configuration
-- references
-- metadata



--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

git clone is used when the repository already exists remotely.
Downloads the repository
Creates the .git folder
Connects the remote repository as origin
git clone https://github.com/BalajiDegala/gitproject.git

git remote -v
So origin is just the default name Git gives to the remote repository.

git clone creates a local copy of an existing remote Git repository and configures that remote as origin.

What is HEAD in Git?
HEAD is a pointer that tells Git:
“Which branch or commit am I currently on?”

git branch to see what is current branch
git branch feature-a to create new branch
git checkout feature-a to create new branch
git checkout -b feature-a --> to create new branch and checkout to that branch


A --- B --- C --- D
                  ↑
                 HEAD

HEAD     -> D
HEAD~1   -> C 
HEAD~2   -> B
HEAD~3   -> A
git show HEAD
git show HEAD~1 or git show HEAD^
git diff HEAD~1 HEAD


HEAD     = current commit
HEAD~1   = previous commit
HEAD~2   = two commits back
HEAD^    = parent commit
HEAD^1   = first parent
HEAD^2   = second parent of a merge commit

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

git log main..origin/main
git merge origin/main
git diff main origin/main

main        = my local branch
origin/main = my local view of remote main
origin      = name of the remote repository

origin is the default name Git assigns to the remote repository when we clone a project. It is only a remote alias, and it can be renamed or replaced.
git remote rename origin github
git push github main

git push origin feature-login
= push the branch

git push -u origin feature-login
= push the branch + remember the remote tracking branch

-u --set-upstream

git branch -d and git branch -D both delete a local branch, but one is safe and one is forceful.

for ex: feature-login has commits not merged into main
git branch -d feature-login
may fail with a warning.
If you are absolutely sure you want to delete it anyway:

git branch -D feature-login
-D means force delete.

To delete a remote branch:
git push origin --delete feature-login

----------------------------------------------------------------------------------------

git merge 

A---B---C   main
     \
      D---E feature --> you are here 

git merge main 
Git combines both histories and usually creates a merge commit: M

A---B---C
     \   \
      D---E---M

Merge keeps the original history exactly as it happened.

If you are on feature and run:
git rebase main

A---B---C---D'---E'
That happens because rebase creates new commits with new commit hashes.


| Merge                          | Rebase |
|---                             |---|
| Combines branch histories      | Moves/replays commits |
| Usually creates a merge commit | Usually no merge commit |
| Preserves original history     | Rewrites commit history |
| History may look branched      | History looks linear |
| Safe for shared branches       | Be careful with shared branches |

We should avoid rebasing a shared branch because rebase rewrites commit history and changes commit hashes. 
If other developers already pulled the old commits, it can create conflicts and inconsistent history.

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

git reset and git revert both help undo changes, but they work very differently.

A --- B --- C
            ↑
          HEAD

If commit C is bad, you have two choices.

git reset moves the branch pointer backward.
Important: reset rewrites history, so it is mainly safer for local/unshared commits.
git reset --soft HEAD~1
--soft  = keep changes staged
git reset --mixed HEAD~1
--mixed = keep changes, unstage them
git reset --hard HEAD~1
--hard  = remove changes completely

git revert does not delete old history.
Instead, it creates a new commit that reverses an earlier commit.
git revert C
A --- B --- C --- D
                  ↑
                HEAD
That is why revert is usually safer for commits already pushed to a shared branch.

| `git reset`                 | `git revert` |
|---                          |---|
| Moves HEAD backward         | Creates a new undo commit |
| Can rewrite history         | Preserves history |
| Best for local commits      | Best for shared/pushed commits |
| `--hard` can delete changes | Does not remove old commits |

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------


git fetch and git pull both get updates from a remote repository, but they behave differently.

A---B---C   origin/main
A---B       main
git fetch
local main:     A---B
origin/main:    A---B---C
git merge origin/main

git pull --> 
git fetch
+
git merge
Download the latest main changes from remote and merge them into my current branch.

| `git fetch`                     | `git pull` |
|---                              |---|
| Downloads changes only          | Downloads and integrates changes |
| Safer for inspection            | More automatic |
| Does not modify current branch  | Can modify current branch |
| You decide when to merge/rebase | Integration happens immediately |

git pull
git pull --rebase

git pull --rebase fetches remote changes and rebases your local commits on top instead of creating a merge commit.

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

git stash temporarily stores your uncommitted changes so you can switch branches or work on something else.

commit = save permanently in history
stash  = keep temporarily aside

git stash
git stash list
git stash pop -- restores the stash and removes it from the stash list.
git stash apply -- restores it but keeps the stash entry.
git stash drop

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

main:     A---B---C

feature:      D---E---F


Suppose you only want commit E from feature, not the whole branch.

git checkout main
git cherry-pick <commit-id-of-E>

A---B---C---E'
Git creates a new commit with the same changes as E, but usually with a new commit hash.
A bug fix was made in a feature branch, but you also need that same fix immediately in main or a release branch.

git cherry-pick is used to apply a specific commit from one branch onto another branch without merging the entire branch.

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

Next question: What is the difference between git checkout and git switch?

git checkout feature
git checkout -b feature
git checkout -- file.txt

git switch feature
git switch -c feature
git restore file.txt

git checkout = older, does many things
git switch   = newer, mainly for switching/creating branches

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

| `git clone`                         | `git fetch` |
|---                                  |---|
| Used initially                      | Used after repo already exists |
| Creates a local repository          | Updates an existing repository |
| Downloads full repository/history   | Downloads new remote changes |
| Usually done once | Done many times |


----------------------------------------------------------------------------------------

git status
modified: app.java
new file: test.txt
changes staged for commit
changes not staged
untracked files

git log
a12bc34 Fixed login bug
b45de67 Added user validation
c98fa21 Initial commit

git reflog
a12bc34 HEAD@{0}: commit: Fixed login bug
b45de67 HEAD@{1}: checkout: moving from feature to main
d78ef90 HEAD@{2}: reset: moving to HEAD~1


| Command      | Purpose |
|---           |---|
| `git status` | Shows current working/staging state |
| `git log`    | Shows commit history |
| `git reflog` | Shows movement/history of HEAD and references |


----------------------------------------------------------------------------------------

If I accidentally remove a commit with git reset --hard, I can use git reflog to find the old commit hash and then restore it using git reset --hard <commit-id> or create a recovery branch from that commit.

A --- B --- C
            ↑
          HEAD


git reset --hard HEAD~1


A --- B
      ↑
    HEAD

Commit C is no longer visible in normal git log, but Git often still knows about it.
git reflog

b123abc HEAD@{0}: reset: moving to HEAD~1
c456def HEAD@{1}: commit: Added login validation


to restore it 
git reset --hard c456def

or

git branch recovery-branch c456def
git switch recovery-branch

----------------------------------------------------------------------------------------


HEAD
 |
 v
main
 |
 v
 C

git checkout <commit-id>
or
git switch --detach <commit-id>

HEAD
 |
 v
 C

main ---> D

A detached HEAD state occurs when HEAD points directly to a commit instead of a branch. It is useful for inspecting or testing an older commit, but if I make new commits there, I should create a branch to keep them safely.

----------------------------------------------------------------------------------------

A Git branch moves, but a Git tag usually stays fixed on a specific commit.

A --- B --- C
            ↑
           main

git tag v1.0

A --- B --- C
            ↑
           main, v1.0

A --- B --- C --- D
            ↑     ↑
          v1.0   main


A branch is used for ongoing development.

git switch -c feature-login

A --- B --- C --- D
                  ↑
            feature-login


A tag is usually used to mark an important point in history, such as a release:

| Branch                                | Tag |
|---                                    |---|
| Moves when new commits are added      | Usually stays fixed |
| Used for development                  | Used for releases/milestones |
| You normally commit while on a branch | You don't normally develop on a tag |


A branch is a movable pointer that advances as new commits are created. A tag is usually a fixed reference to a specific commit and is commonly used to mark releases such as v1.0 or v2.0.


----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

A merge conflict happens when Git cannot automatically combine changes, usually because the same part of a file was changed differently. I resolve the file manually, stage it, and then continue the merge or rebase.

----------------------------------------------------------------------------------------


.gitignore tells Git which files or folders it should not track.
node_modules/
*.log
.env
target/
.idea/

build files
logs
IDE settings
temporary files
secrets
dependencies

----------------------------------------------------------------------------------------


git remote -v

add one:
git remote add origin https://github.com/user/project.git

Change the URL:
git remote set-url origin https://github.com/user/new-project.git

remove origin
git remote remove origin

----------------------------------------------------------------------------------------

--amend lets you modify your most recent commit.

git commit -m "update login"
git add missing-file.txt

git commit --amend
git commit --amend -m "Fix login validation"

----------------------------------------------------------------------------------------

Typical workflow:

git clone <repo-url>
cd project

git switch -c feature-login

# make changes

git status

git add .

git commit -m "Add login validation"

git fetch origin

git rebase origin/main

or sometimes:

git merge origin/main

then 

git push -u origin feature-login




clone
  ↓
create branch
  ↓
make changes
  ↓
git add
  ↓
git commit
  ↓
sync with main
  ↓
git push
  ↓
create PR
  ↓
review
  ↓
merge


My normal workflow is to clone the repository, create a feature branch, make changes, stage and commit them, sync with the latest main branch using fetch and rebase or merge, push the feature branch, and create a pull request for review.
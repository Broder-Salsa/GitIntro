# 🎓 Instructor Guide: Teaching Git with Git Disco

This guide is designed for the instructor (acting as the **Tech Lead** / **Maintainer**) to run a frictionless, high-energy Git and GitHub workshop.

---

## ⏱️ Recommended Workshop Timeline (45–60 Minutes)

| Time | Phase | Focus |
| :--- | :--- | :--- |
| **00:00 – 00:10** | **The Big Picture** | What is Git vs. GitHub? Why branches? Show the live disco floor with only the DJ on stage. |
| **00:10 – 00:20** | **Hands-On Part 1** | Students clone, run `python3 server.py`, switch branch, and create their `cats/[username].json`. |
| **00:20 – 00:30** | **Hands-On Part 2** | `git add`, `git commit`, `git push`, and opening Pull Requests on GitHub. |
| **00:30 – 00:45** | **The Review Cycle** | Tech Lead reviews PRs live on projector, requests one trivial change, students push revisions, merge all! |
| **00:45 – 00:55** | **The Finale** | Everyone runs `git switch main && git pull`. Turn up the disco beat and celebrate! |

---

## 🛠️ Pre-Class Setup (5 Minutes)

### Option A: Shared Repository with Direct Branching (Recommended for small to medium classes < 30)
1. Initialize a new repo on GitHub (e.g. `github.com/your-org/git-intro`).
2. Push this project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for git disco workshop"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/git-intro.git
   git push -u origin main
   ```
3. Go to **Settings > Collaborators** on GitHub and add students, or create an organization team.

### Option B: Forking Model (Recommended for large classes > 30)
1. Make your repository public.
2. Students click **Fork** on GitHub.
3. Students clone their fork, make their branch, and open cross-repo Pull Requests to your upstream repository.

---

## 🎭 Running Step 7: The "Trivial Change" PR Review Cycle

One of the most important learning objectives is teaching students that **a Pull Request is a conversation, not just a final exam.**

When students open PRs, projector-share GitHub and review 2–3 in front of the whole class:

### Great "Trivial Changes" to Request in PR Comments:
1. *"Looks awesome! But our disco dress code requires cool accessories: could you add `\"accessory\": \"sunglasses\"`?"*
2. *"Could you boost the groove speed to `\"hyper\"`?"*
3. *"Love the cat name, can you give it a funkier catchphrase?"*
4. *"Can you change the dance style to `\"breakdance\"` or `\"spin\"`?"*

### What to Explain to Students:
- Emphasize: **"You do not need to open a new Pull Request!"**
- Show how making a new commit on the same branch and running `git push` automatically updates the existing Pull Request.

---

## ⚠️ Common Student Mistakes & How to Fix Them

### Mistake 1: Student edited `cats/TEMPLATE.json` instead of creating their own file
- **Symptoms:** PR shows changes to `cats/TEMPLATE.json`.
- **Fix:**
  ```bash
  # Copy their edits to their username file
  cp cats/TEMPLATE.json cats/username.json
  # Revert the template back to clean state
  git checkout origin/main -- cats/TEMPLATE.json
  git add cats/
  git commit -m "fix: restore template and create personal cat file"
  git push
  ```

### Mistake 2: Student committed directly on `main` before branching
- **Symptoms:** Student ran `git commit` while still on `main`.
- **Fix:**
  ```bash
  git branch add-cat-username      # creates the branch pointing to their commit
  git reset --hard origin/main     # resets local main back to clean upstream
  git switch add-cat-username      # switch to their new branch
  git push -u origin add-cat-username
  ```

### Mistake 3: Invalid JSON (e.g., trailing comma or missing quotes)
- **Symptoms:** GitHub Actions `validate-cat.yml` turns RED ❌.
- **Fix:**
  Show the GitHub Actions log on screen! Explain:
  *"CI (Continuous Integration) caught a JSON syntax error before it reached production! Look at line 9: JSON does not permit trailing commas."*
  Student removes comma, commits, pushes, and the check turns GREEN ✅.

### Mistake 4: Merge conflicts? (Why this architecture is brilliant)
Because each student creates their own distinct file (`cats/[username].json`), **there are practically zero merge conflicts during the PR merge phase!**
This guarantees a smooth, rewarding first Git experience without students getting blocked or demoralized.

---

## 🌟 Bonus / Advanced Demos (If Time Permits)

1. **Demonstrating an Intentional Merge Conflict:**
   - Ask two brave volunteers to both edit `cats/instructor.json` at the same time to change the DJ's catchphrase.
   - Merge Volunteer A's PR first.
   - Show how Volunteer B's PR now displays a **Merge Conflict** banner on GitHub.
   - Walk through resolving the conflict using VS Code's merge conflict editor!

2. **GitHub Pages Deployment:**
   - In GitHub Settings > Pages, select `main` branch root.
   - Now the entire class can access the live dancing floor on their mobile phones and tablets at `https://your-username.github.io/git-intro`!

# 🐱 🪩 Git Disco: The Collaborative Git Dance Floor

Welcome to **Git Disco**! In this hands-on workshop, you will learn the core Git and GitHub collaboration workflow by putting your own animated dancing cat onto the class disco dance floor!

---

## 🎯 Workshop Objective

Every student will create their own branch, configure a dancing cat via JSON, push their branch, and open a Pull Request (PR). Once the instructor reviews and merges everyone's PRs, we will all pull `main` to see the entire class grooving together!

---

## 🚀 Step-by-Step Instructions for Students

### 1. Clone the Repository

Clone this repository to your computer and navigate into the folder:

```bash
git clone <REPO_URL>
cd GitIntro
```

### 2. Launch the Dance Floor Locally

**No Python, Node, or server required!**
Simply open `index.html` in your web browser:

- **Mac:** `open index.html` (or double-click `index.html` in Finder)
- **Windows:** `start index.html` (or double-click `index.html` in File Explorer)
- **Linux:** `xdg-open index.html`

The disco dance floor will immediately load right in your browser!

---

### 3. Create Your Feature Branch

Never work directly on `main`! Create a branch named after your GitHub username:

```bash
git switch -c add-cat-[your-username]
```

*(For example: `git switch -c add-cat-sarah123`)*

---

### 4. Create Your Cat Configuration File

Copy the template file to a new file named `cats/[your-username].json`:

```bash
cp cats/TEMPLATE.json cats/[your-username].json
```

*(Example: `cp cats/TEMPLATE.json cats/sarah123.json`)*

Now open `cats/[your-username].json` in your editor (VS Code, Cursor, Nano, etc.) and customize it:

```json
{
  "username": "sarah123",
  "name": "Sarah Connor",
  "cat_name": "CyberCat-9000",
  "breed": "neon",
  "favorite_color": "#00FFCC",
  "dance_style": "breakdance",
  "accessory": "sunglasses",
  "groove_speed": "hyper",
  "catchphrase": "Come with me if you want to dance!"
}
```

#### 🎨 Customization Options

| Property | Allowed Values |
| :--- | :--- |
| **`breed`** | `calico`, `tuxedo`, `ginger`, `siamese`, `void`, `neon` |
| **`dance_style`** | `breakdance`, `bounce`, `spin`, `moonwalk`, `disco`, `headbang`, `robot`, `wiggle` |
| **`accessory`** | `sunglasses`, `party-hat`, `headphones`, `gold-chain`, `bow-tie`, `crown`, `none` |
| **`favorite_color`**| Any Hex color (e.g. `#FF007F`, `#00F0FF`) or CSS color name |
| **`groove_speed`** | `chill`, `normal`, `hyper` |
| **`catchphrase`** | Any fun quote or dance mantra! |

> [!TIP]
> **Preview your cat before pushing:**
> Want to see what your cat looks like before committing?
> In `index.html`, click **"📂 PREVIEW MY CAT"** and select your file, or **drag and drop** your `cats/[your-username].json` file anywhere onto the dance floor window!

---

### 5. Check Git Status, Commit, and Push

Check what changes you've made:

```bash
git status
```

Stage your new cat file:

```bash
git add cats/[your-username].json
```

Commit your changes with a descriptive message:

```bash
git commit -m "feat(cats): add [your-username] to dance floor"
```

Push your branch to GitHub:

```bash
git push -u origin add-cat-[your-username]
```

---

### 6. Open a Pull Request (PR) on GitHub

1. Go to the repository on GitHub.
2. You will see a yellow banner: **"add-cat-[your-username] had recent pushes"** with a green button: **"Compare & pull request"**. Click it!
3. Title your PR: `feat: Add [your-username]'s cat to the disco`.
4. Submit the Pull Request.
5. GitHub Actions will automatically check that your JSON syntax and properties are valid! ✅

---

### 7. The Code Review Cycle (Tech Lead Review)

Your instructor (the Tech Lead) will review your PR.
- If they request a small revision (e.g. *"Change your cat's dance style to robot"* or *"Add a cooler catchphrase"*):
  1. Edit your local file `cats/[your-username].json`.
  2. Commit and push again:
     ```bash
     git add cats/[your-username].json
     git commit -m "fix: update catchphrase per review"
     git push
     ```
  3. Notice how your Pull Request automatically updates!

---

### 8. The Grand Finale: Merge & Pull! 🎉

Once the instructor merges the Pull Requests:

1. Switch back to your local `master` branch:
   ```bash
   git switch master
   ```
2. Pull all merged changes from the class:
   ```bash
   git pull origin master
   ```
3. Refresh `index.html` in your browser!
4. **Turn on the PLAY BEAT button**, adjust the BPM, and watch the entire class dance together! 🪩🐱

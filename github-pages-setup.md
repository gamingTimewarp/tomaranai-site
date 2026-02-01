# GitHub Pages Setup Guide

## What You'll End Up With
A live website at a URL like `https://yourname.github.io/my-site/` — totally free, no servers to manage.

---

## Step 1 — Install Git (if you haven't already)

If you've used GitHub from the command line before, you're good. Otherwise:

1. Go to https://git-scm.com/downloads
2. Download and run the installer for Windows (or your OS).
3. Open a terminal/command prompt and confirm it works:
```
git --version
```
You should see something like `git version 2.x.x`.

---

## Step 2 — Create a Repository on GitHub

1. Go to https://github.com and sign in (or create a free account).
2. Click the **+** icon in the top-right corner → **New repository**.
3. Name it something like `my-site` (this becomes part of your URL).
4. Check **"Add a README"** so the repo isn't empty.
5. Click **Create repository**.

---

## Step 3 — Clone the Repo to Your Machine

This downloads the repo folder onto your computer so you can work in it locally.

1. On your new repo page, click the green **Code** button.
2. Copy the HTTPS URL (e.g. `https://github.com/YourName/my-site.git`).
3. Open a terminal and run:
```
git clone https://github.com/YourName/my-site.git
```
4. Navigate into the folder:
```
cd my-site
```

---

## Step 4 — Add Your Files

Copy `index.html` and `style.css` into the `my-site` folder. Your folder should look like this:

```
my-site/
  ├── index.html
  ├── style.css
  └── README.md       ← this was auto-created by GitHub
```

---

## Step 5 — Commit and Push

This saves your work to GitHub (think of it like a detailed "Save As" with a message).

```
git add .
git commit -m "Initial site: homepage with stories and blog cards"
git push origin main
```

If this is your first time pushing, Git might ask you to log in — just use your GitHub credentials.

---

## Step 6 — Enable GitHub Pages

This is the one-time flip that turns your repo into a live website.

1. Go to your repo on github.com.
2. Click **Settings** (in the top menu of the repo).
3. In the left sidebar, click **Pages**.
4. Under **Branch**, select `main`.
5. Under **Folder**, select `/ (root)`.
6. Click **Save**.

GitHub will show you a green banner with your live URL — something like:
`https://yourname.github.io/my-site/`

It can take 1–2 minutes the first time to go live.

---

## Step 7 — Verify It Works

Open that URL in your browser. You should see your homepage!

If it's not showing up after a few minutes, double-check:
- That `index.html` is in the **root** of the repo (not inside a subfolder).
- That the file is actually named `index.html` (not `Index.HTML` or anything else — casing matters).

---

## Going Forward — How to Update Your Site

Every time you make changes to your files, just repeat Steps 5's three commands:

```
git add .
git commit -m "A short description of what you changed"
git push origin main
```

GitHub Pages will automatically rebuild your site within seconds. No restarts, no deploys to manage.

---

## Cheat Sheet

| What you want to do              | Command                                      |
|----------------------------------|----------------------------------------------|
| Save all changes locally         | `git add .`                                  |
| Commit with a message            | `git commit -m "your message here"`          |
| Push to GitHub (and update site) | `git push origin main`                       |
| Pull latest changes from GitHub  | `git pull origin main`                       |
| See what's changed locally       | `git status`                                 |

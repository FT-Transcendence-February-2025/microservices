Git subtree is a built‐in Git mechanism that lets you incorporate another repository into a subdirectory of your own project. Unlike submodules, the code is fully integrated into your repository’s history, but you can still pull and push changes to the external repository when needed. Here’s a comprehensive guide to getting started with Git subtree.

---

## 1. When and Why to Use Git Subtree

- **No More Submodule Hassles:**  
  With subtrees, you don’t have to worry about separate checkouts or initializing submodules. The external project’s code is stored directly inside your repository.

- **Integrated History:**  
  You can squash the imported commits into one or preserve the full history while keeping the two projects logically separated.

- **Easy Updates:**  
  You can pull in updates from the external repository or push your contributions back upstream—all from within your main project.

---

## 2. Basic Commands and Workflow

Let’s assume you want to include a repository located at `https://github.com/example/component.git` into your project under the directory `component`.

### A. Add the External Repository as a Remote

First, add the remote so that Git knows where to fetch from or push to:

```bash
git remote add authentication https://github.com/example/component.git
git remote set-url authentication https://$(cat $TOKEN)@github.com/FT-Transcendence-February-2025/authentication-service.git
 git fetch component main
git subtree add --prefix=services/authentication-service/src authentication main --squash

```

### B. Import the Repository as a Subtree

Use the `git subtree add` command to pull in the remote repository into a subdirectory. The `--prefix` flag designates the directory in your project. You can choose either to squash the history or import all the commits.

- **With Squashed History:**  
  (Recommended to keep your history clean.)

  ```bash
  git subtree add --prefix=component component main --squash
  ```
  This imports the `main` branch of the remote into the `component/` directory with a single squashed commit.

- **Without Squashing:**  
  (Retains full commit history from the subtree.)

  ```bash
  git subtree add --prefix=component component main
  ```

### C. Pull Updates from the Subtree

If the external repository gets updated, you can incorporate the changes into your project later on:

- **With Squash (usually the same as when you added it):**

  ```bash
  git subtree pull --prefix=component component main --squash
  ```

- **Without Squash:**

  ```bash
  git subtree pull --prefix=component component main
  ```

This fetches the changes from the remote’s `main` branch and merges them into your `component/` directory.

### D. Push Changes Back to the Remote

If you make changes within the subtree that you intend to contribute back to the external repository, use:

```bash
git subtree push --prefix=component component main
```

This command extracts the commits from the `component/` directory and pushes them to the remote’s `main` branch.

### E. Splitting Out a Subtree

Sometimes you might want to extract the subtree’s history into its own branch (for instance, if you plan to convert that subdirectory into an independent repository):

```bash
git subtree split --prefix=component -b split-component
```

This creates a new branch (`split-component`) that contains the history of the `component/` directory. You can then use this branch to, say, create a separate repository.

---

## 3. Visual Overview

Imagine your project structured like this after you add a subtree:

```
My-Main-Repo/
├── .git
├── README.md
└── component/       <-- Git subtree contents here
    ├── file1.js
    ├── file2.js
    └── (component's commit history integrated into your repo)
```

- **Adding the subtree** puts all the external code inside the `component/` folder.  
- **Pulling updates** merges any new changes from the external source into that same folder.  
- **Pushing** extracts the changes from `component/` and sends them back to the external repository.

---

## 4. Example Workflow

Here’s an end-to-end example:

1. **Add the Remote:**

   ```bash
   git remote add component https://github.com/example/component.git
   ```

2. **Add the Subtree (with squash to keep history clean):**

   ```bash
   git subtree add --prefix=component component main --squash
   ```

3. **Later, Pull in Updates:**

   ```bash
   git subtree pull --prefix=component component main --squash
   ```

4. **Push Local Changes in the Subtree to the Remote:**

   ```bash
   git subtree push --prefix=component component main
   ```

5. **(Optional) Split the Subtree’s History into Its Own Branch:**

   ```bash
   git subtree split --prefix=component -b split-component
   ```

---

## 5. Tips and Considerations

- **Choose Squashing vs. Full History:**  
  - **--squash:** Keeps your main repo’s history cleaner by combining subtree commits into one.
  - **Without --squash:** Preserves each commit from the external repository, which may be useful for detailed history or debugging.

- **Remote Naming:**  
  The name you assign (in our case, `component`) makes it easy to remember which remote corresponds to your subtree.

- **Integration vs. Independence:**  
  Git subtree gives you the benefit of integrated tracking while still allowing you to treat that directory as an independent project when needed.

---

By following these steps, Git subtree becomes a powerful tool in your Git toolbox—allowing you to keep projects modular, integrate external libraries, or even split a subdirectory into its own repository later on.

If you have specific scenarios or run into issues—for instance, with merge conflicts in a subtree, or need more advanced branching strategies—feel free to ask!
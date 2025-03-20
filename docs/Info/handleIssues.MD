To create an issue and have a corresponding branch in your local repository, you can follow these steps:

### 1. Create an Issue on GitHub

1. **Go to your repository on GitHub**.
2. **Navigate to the Issues tab**.
3. **Click on "New issue"**.
4. **Fill in the issue details** (title, description, labels, assignees, etc.).
5. **Submit the issue**.

### 2. Create a Branch for the Issue in Your Local Repository

1. **Fetch the latest changes** from the remote repository to ensure your local repository is up-to-date:

    ```bash
    git fetch origin
    ```

2. **Create a new branch** for the issue. It’s a good practice to name the branch after the issue number and a short description:

    ```bash
	# rule listIssues shows issue name and number
    git checkout -b issue-<issue-number>-<short-description>
    ```

    Replace `<issue-number>` with the actual issue number and `<short-description>` with a brief description of the issue.

### 3. Work on the Issue

1. **Make changes** to your code to address the issue.
2. **Stage the changes**:

    ```bash
    git add .
    ```

3. **Commit the changes** with a meaningful message:

    ```bash
    git commit -m "Fixes #<issue-number>: <commit-message>"
    ```

    Replace `<issue-number>` with the actual issue number and `<commit-message>` with a brief description of the changes.

### 4. Push the Branch to the Remote Repository

1. **Push the branch** to the remote repository:

    ```bash
    git push origin issue-<issue-number>-<short-description>
    ```

### 5. Create a Pull Request

1. **Go to your repository on GitHub**.
2. **Navigate to the Pull Requests tab**.
3. **Click on "New pull request"**.
4. **Select your branch** as the compare branch.
5. **Submit the pull request**.

### Example Workflow

1. **Create an Issue on GitHub**:
    - Issue number: `42`
    - Title: `Fix authentication bug`

2. **Create a Branch for the Issue**:

    ```bash
    git fetch origin
    git checkout -b issue-42-fix-authentication-bug
    ```

3. **Work on the Issue**:
    - Make changes to the code.
    - Stage and commit the changes:

    ```bash
    git add .
    git commit -m "Fixes #42: Fixed authentication bug"
    ```

4. **Push the Branch**:

    ```bash
    git push origin issue-42-fix-authentication-bug
    ```

5. **Create a Pull Request** on GitHub.

By following these steps, you can effectively create an issue and have a corresponding branch in your local repository to work on it.
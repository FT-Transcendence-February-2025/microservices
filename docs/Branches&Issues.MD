To stash your changes and apply them to a new branch, follow these steps:

1. **Stash your changes**:
    ```sh
    git stash
    ```

2. **Create and switch to a new branch**:
    ```sh
    git checkout -b my-feature-branch
    ```

3. **Apply the stashed changes to the new branch**:
    ```sh
    git stash apply
    ```

4. **Commit the changes**:
    ```sh
    git add .
    git commit -m "Apply stashed changes to new branch"
    ```

5. **Push the new branch to the remote repository**:
    ```sh
    git push origin my-feature-branch
    ```

Now you can create a pull request for the new branch on GitHub.
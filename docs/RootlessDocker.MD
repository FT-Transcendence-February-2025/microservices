

## Install Docker Engine and Rootless Extras

1. **Install Prerequisites:**  
   Install required packages including `uidmap` (needed for rootless mapping), plus other dependencies:
   ```bash
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common uidmap
   ```

2. **Add Docker’s Official GPG Key and Repository:**  
   Import Docker’s key:
   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```
   Then add the Docker repository (this example auto-detects your Ubuntu release):
   ```bash
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
   https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

3. **Install Docker Packages:**  
   Update your apt cache and install Docker Community Edition along with the rootless extras:
   ```bash
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-ce-rootless-extras
   ```

---

## 3. Configure for Rootless Mode

1. **Set Up Subordinate UID and GIDs:**  
   Docker’s rootless mode uses a range of subordinate user IDs and group IDs. Make sure your user has an allocation. You can append a line to both `/etc/subuid` and `/etc/subgid` (you may need sudo for this). Replace `your-username` with your actual Linux user:
   ```bash
   echo "$USER:100000:65536" | sudo tee -a /etc/subuid /etc/subgid
   ```

2. **Run the Rootless Setup Tool:**  
   Docker provides a helper script that configures the environment for you. Run:
   ```bash
   dockerd-rootless-setuptool.sh install
   ```
   This step sets up necessary environment variables (often it prints instructions to add an environment variable export to your shell configuration, such as `~/.bashrc` or `~/.profile`).

   > **Note:** Follow any on-screen instructions provided by the tool. You may need to log out and log back in or source the suggested profile file (e.g., `source ~/.bashrc`) to make sure the new environment variables (like `DOCKER_HOST`) are applied.

---

## 4. Starting Docker in Rootless Mode with nohup

Once your environment is set up:

1. **Verify the Location of the Rootless Daemon Script:**  
   Confirm the script exists in your PATH:
   ```bash
   which dockerd-rootless.sh
   ```
   It will normally output a path such as `/usr/bin/dockerd-rootless.sh`.

2. **Start the Docker Daemon Using nohup:**  
   To run the rootless Docker daemon in the background (so it’s not killed when you close your terminal), use nohup:
   ```bash
   nohup dockerd-rootless.sh > ~/dockerd-rootless.log 2>&1 &
   ```
   - **nohup** prevents the process from being terminated when you log out.
   - The output (both stdout and stderr) is redirected to `~/dockerd-rootless.log`.
   - The command runs in the background, thanks to the trailing `&`.

3. **Verify Docker Is Running:**  
   You can check that Docker is up with:
   ```bash
   docker info
   ```
   or
   ```bash
   ps aux | grep dockerd-rootless
   ```
   If everything is configured correctly, you’ll see Docker’s info and the list of containers (even if empty) and other details.



---

#!/bin/bash

# Function to check if Docker is running in rootless mode
check_rootless_docker() {
    if pgrep -f "dockerd-rootless.sh" > /dev/null; then
        echo "✔ Docker is running in rootless mode."
        return 0
    else
        echo "✖ Docker is NOT running in rootless mode."
        return 1
    fi
}

# Function to detect if the environment is WSL
check_if_wsl() {
    if grep -qEi "(microsoft|wsl)" /proc/version &> /dev/null; then
        echo "✔ This environment is WSL."
        return 0
    else
        echo "✔ This is a standard Linux distribution."
        return 1
    fi
}

# Function to start rootless Docker if it isn't running
start_rootless_docker() {
    if ! check_rootless_docker; then
        echo "Starting Docker in rootless mode..."
        nohup dockerd-rootless.sh > ~/docker-rootless.log 2>&1 &
        sleep 3  # Give the daemon some time to start
        if check_rootless_docker; then
            echo "✔ Docker rootless daemon started successfully."
        else
            echo "✖ Failed to start Docker in rootless mode. Check ~/docker-rootless.log for details."
        fi
    fi
}

# Function to ensure networking works in rootless mode
configure_rootless_networking() {
    # Check if net.ipv4.ip_unprivileged_port_start is properly set
    REQUIRED_KEY="net.ipv4.ip_unprivileged_port_start"
    REQUIRED_VALUE="80"

    # Check current runtime value
    CURRENT_VALUE=$(sysctl -n $REQUIRED_KEY 2>/dev/null)
    if [ "$CURRENT_VALUE" = "$REQUIRED_VALUE" ]; then
        echo "✔ $REQUIRED_KEY is already set to $REQUIRED_VALUE."
    else
        echo "✖ $REQUIRED_KEY is not set to $REQUIRED_VALUE. Updating runtime configuration..."
        sudo sysctl -w $REQUIRED_KEY=$REQUIRED_VALUE
    fi

    # Check if the setting already exists in /etc/sysctl.conf
    if ! grep -q "^$REQUIRED_KEY=$REQUIRED_VALUE" /etc/sysctl.conf; then
        echo "✔ Adding $REQUIRED_KEY to /etc/sysctl.conf..."
        echo "$REQUIRED_KEY=$REQUIRED_VALUE" | sudo tee -a /etc/sysctl.conf > /dev/null
    else
        echo "✔ $REQUIRED_KEY is already present in /etc/sysctl.conf."
    fi
}


# Function to configure DNS for Docker
configure_docker_dns() {
    DNS_FILE="$HOME/.config/docker/daemon.json"
    # This is the DNS configuration that we want to add.
    NEW_DNS='{"dns": ["8.8.8.8", "1.1.1.1"]}'

    mkdir -p "$(dirname "$DNS_FILE")"

    if [ -f "$DNS_FILE" ]; then
        echo "✔ DNS configuration file already exists. Updating..."
        # Back up the current file
        cp "$DNS_FILE" "${DNS_FILE}.bak"
        jq '. + {"dns": ["8.8.8.8", "1.1.1.1"]}' "$DNS_FILE" > "$DNS_FILE.tmp" && mv "$DNS_FILE.tmp" "$DNS_FILE"
    else
        echo "✔ Creating DNS configuration file for Docker..."
        echo "$NEW_DNS" > "$DNS_FILE"
    fi

    echo "✔ DNS servers added to $DNS_FILE."
}

# Main execution flow
echo "Checking Docker setup..."

# Determine if the environment is WSL or Linux
if check_if_wsl; then
    echo "✔ WSL detected. Adjusting for WSL-specific configuration..."
    # If WSL, ensure /etc/resolv.conf or other networking tweaks are applied if needed
    if [ -f /etc/resolv.conf ]; then
        echo "✔ WSL DNS appears configured. Double-check Docker container network if needed."
    else
        echo "✖ WSL DNS is misconfigured. Check /etc/resolv.conf."
    fi
else
    echo "✔ Standard Linux detected. Proceeding with standard configuration."
fi

# Check if Docker is running in rootless mode
start_rootless_docker

# Configure networking for rootless mode
configure_rootless_networking

# Configure DNS for Docker
configure_docker_dns

echo "Docker setup complete. Verify connectivity by running 'docker info' or starting your containers."

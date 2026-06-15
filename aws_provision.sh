#!/bin/bash

# CampusReuse EC2 Provisioning Script
# OS: Ubuntu 22.04 LTS

echo "Starting EC2 Provisioning..."

# 1. Update packages
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker
echo "Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Add current user (ubuntu) to docker group to run docker without sudo
sudo usermod -aG docker ubuntu

# 4. Clone the repository (Replace with actual repo link when ready)
# cd /home/ubuntu
# git clone https://github.com/AdityaJadhav/campusReuse.git
# cd campusReuse

echo "Provisioning complete! Please log out and log back in for docker group permissions to take effect."
echo "Next steps:"
echo "1. Run: export VITE_API_BASE_URL=http://<YOUR-EC2-PUBLIC-IP>:8080"
echo "2. Run: docker compose up -d --build"

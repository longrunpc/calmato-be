#!/bin/bash

# EC2 Ubuntu 서버 초기 설정 스크립트
# 사용법: sudo bash setup-ec2.sh

set -e

echo "🚀 EC2 서버 초기 설정을 시작합니다..."

# 시스템 업데이트
echo "📦 시스템 패키지 업데이트 중..."
apt update && apt upgrade -y

# 필수 패키지 설치
echo "📋 필수 패키지 설치 중..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Docker 설치
echo "🐳 Docker 설치 중..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker 서비스 시작 및 부팅 시 자동 시작 설정
systemctl start docker
systemctl enable docker

# Docker Compose 설치 (standalone)
echo "🔧 Docker Compose 설치 중..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Node.js 설치 (GitHub Actions 러너용)
echo "📗 Node.js 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 방화벽 설정
echo "🔥 방화벽 설정 중..."
ufw allow ssh
ufw allow 3000
ufw --force enable

# 배포 디렉토리 생성
echo "📁 배포 디렉토리 생성 중..."
mkdir -p /opt/calmato
chown -R $SUDO_USER:$SUDO_USER /opt/calmato

# Git 설정 (GitHub Actions용)
echo "🔑 Git 설정 중..."
if [ ! -f /home/$SUDO_USER/.ssh/id_rsa ]; then
    echo "SSH 키가 없습니다. GitHub에 등록할 SSH 키를 생성하세요:"
    echo "ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'"
fi

# Docker 그룹에 사용자 추가
usermod -aG docker $SUDO_USER

# 로그 로테이션 설정
echo "📝 로그 로테이션 설정 중..."
cat > /etc/logrotate.d/calmato << EOF
/opt/calmato/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $SUDO_USER $SUDO_USER
}
EOF

# 시스템 모니터링 설정
echo "📊 모니터링 도구 설치 중..."
apt install -y htop iotop netstat-ss

# 보안 설정
echo "🔒 보안 설정 적용 중..."
# 불필요한 서비스 비활성화
systemctl disable --now snapd || true

# 커널 파라미터 최적화
cat >> /etc/sysctl.conf << EOF
# Calmato 애플리케이션 최적화
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
vm.swappiness = 10
fs.file-max = 2097152
EOF
sysctl -p

echo "✅ EC2 서버 초기 설정이 완료되었습니다!"
echo ""
echo "다음 단계를 수행하세요:"
echo "1. 서버 재부팅: sudo reboot"
echo "2. GitHub Secrets 설정:"
echo "   - EC2_HOST: 이 서버의 퍼블릭 IP"
echo "   - EC2_USERNAME: $SUDO_USER"
echo "   - EC2_PRIVATE_KEY: SSH 개인키"
echo "   - JWT_SECRET: JWT 서명 키"
echo "   - CORS_ORIGIN: 허용할 도메인"
echo "3. 이 서버의 SSH 공개키를 GitHub Deploy Keys에 추가"
echo ""
echo "🎉 설정 완료!" 
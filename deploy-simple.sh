#!/bin/bash
# 太初星集电子签章系统 - 简化部署脚本
# 直接在服务器上用 Java/Node 运行（无需 Docker）

set -e

# ==================== 配置信息 ====================
REMOTE_HOST="60.10.240.4"
REMOTE_PORT="25813"
REMOTE_USER="root"
SSH_KEY="/Users/cx/Documents/huaweikey/KeyPair-4bd7.pem"
REMOTE_DIR="/opt/apps/tc-seal"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  太初星集电子签章系统 - 简化部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# SSH 执行远程命令
remote_exec() {
    ssh -i "$SSH_KEY" -p "$REMOTE_PORT" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "$1"
}

# ==================== 构建后端 ====================
echo -e "${YELLOW}[1/4] 构建后端 Spring Boot...${NC}"
remote_exec "cd $REMOTE_DIR/backend && mvn clean package -DskipTests -q"
echo -e "${GREEN}✓ 后端构建完成${NC}"

# ==================== 构建前端 ====================
echo -e "${YELLOW}[2/4] 构建前端 Next.js...${NC}"
remote_exec "cd $REMOTE_DIR/frontend && npm install && npm run build"
echo -e "${GREEN}✓ 前端构建完成${NC}"

# ==================== 停止旧服务 ====================
echo -e "${YELLOW}[3/4] 停止旧服务...${NC}"
remote_exec "pkill -f 'tc-seal.*jar' 2>/dev/null || true"
remote_exec "pkill -f 'next-server' 2>/dev/null || true"
sleep 2
echo -e "${GREEN}✓ 旧服务已停止${NC}"

# ==================== 启动新服务 ====================
echo -e "${YELLOW}[4/4] 启动新服务...${NC}"

# 启动后端
remote_exec "cd $REMOTE_DIR/backend && nohup java -jar target/*.jar --spring.profiles.active=prod > /var/log/tc-seal-backend.log 2>&1 &"
echo "  后端服务启动中..."

# 等待后端启动
sleep 10

# 启动前端
remote_exec "cd $REMOTE_DIR/frontend && NEXT_PUBLIC_API_URL=http://$REMOTE_HOST:8099 nohup npm start > /var/log/tc-seal-frontend.log 2>&1 &"
echo "  前端服务启动中..."

sleep 5

# ==================== 验证服务 ====================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "前端地址: ${YELLOW}http://$REMOTE_HOST:3000${NC}"
echo -e "后端地址: ${YELLOW}http://$REMOTE_HOST:8099${NC}"
echo ""
echo -e "查看后端日志: ${YELLOW}ssh -i \"$SSH_KEY\" -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST \"tail -f /var/log/tc-seal-backend.log\"${NC}"
echo -e "查看前端日志: ${YELLOW}ssh -i \"$SSH_KEY\" -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST \"tail -f /var/log/tc-seal-frontend.log\"${NC}"

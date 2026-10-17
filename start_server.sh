#!/bin/bash
# KeShip 网站启动脚本
# 用法: bash /root/keship-website/start_server.sh

PORT=8080
WEB_DIR="/root/keship-website"
LOG_FILE="/tmp/keship-server.log"

# 检查是否已有实例在运行
if pgrep -f "http.server ${PORT}" | grep -v grep | grep -q .; then
    echo "KeShip 网站服务器已在运行 (端口 ${PORT})"
    exit 0
fi

# 检查网站目录是否存在
if [ ! -f "${WEB_DIR}/index.html" ]; then
    echo "错误: 网站文件不存在于 ${WEB_DIR}"
    exit 1
fi

# 启动服务器
cd "${WEB_DIR}"
nohup python3 -m http.server ${PORT} --bind 0.0.0.0 > "${LOG_FILE}" 2>&1 &
sleep 2

# 验证
if pgrep -f "http.server ${PORT}" | grep -v grep | grep -q .; then
    echo "KeShip 网站服务器已启动 (端口 ${PORT})"
    echo "访问地址: https://${PORT}-$(hostname).workspace.developer.huaweicloud.com/"
else
    echo "启动失败，请检查日志: ${LOG_FILE}"
    exit 1
fi

/**
 * useWebSocket.ts
 * Vue3 + TypeScript 封装 WebSocket Hook
 *
 * ✅ 支持功能：
 *  - 自动重连（含断网后恢复）
 *  - 心跳检测（保持连接活性）
 *  - 消息发送 / 接收
 *  - 状态管理（连接状态、错误、重连次数）
 *  - 自动清理
 *
 * 🧠 面试可讲点：
 *  - 区分浏览器离线事件与 onclose
 *  - 避免重复连接、冲突重连
 *  - 断网后自动检测恢复并重连
 */

import { ref, onUnmounted } from "vue";

interface WebSocketOptions {
  reconnectInterval?: number; // 重连间隔时间（默认 3000ms）
  maxReconnectAttempts?: number; // 最大重连次数（默认 10 次）
  heartbeatInterval?: number; // 心跳间隔（默认 10000ms）
  debug?: boolean; // 是否开启日志输出
}

export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  // ===============================
  // 1️⃣ 初始化配置
  // ===============================
  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 10000,
    debug = false,
  } = options;

  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const error = ref<Error | null>(null);
  const reconnectCount = ref(0);

  // 内部状态
  let manuallyClosed = false; // 是否为手动关闭
  let heartbeatTimer: number | null = null; // 心跳定时器
  let reconnectTimer: number | null = null; // 重连定时器

  // ===============================
  // 2️⃣ 日志函数
  // ===============================
  const log = (...args: any[]) => {
    if (debug) console.log("[WebSocket]", ...args);
  };

  // ===============================
  // 3️⃣ 建立连接
  // ===============================
  const connect = () => {
    manuallyClosed = false; // 重置手动关闭状态
    // 避免重复连接或手动关闭后继续连
    if (ws.value || manuallyClosed) return;

    log("🔗 尝试连接中...");
    const socket = new WebSocket(url);
    ws.value = socket;

    // 连接成功
    socket.onopen = () => {
      log("✅ 已连接");
      isConnected.value = true;
      error.value = null;
      reconnectCount.value = 0;
      startHeartbeat();
    };

    // 收到消息
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        log("📩 收到消息:", data);
      } catch {
        log("📩 收到原始消息:", event.data);
      }
    };

    // 连接出错
    socket.onerror = (err) => {
      error.value = new Error("WebSocket error");
      log("❌ 连接错误:", err);
    };

    // 连接关闭
    socket.onclose = (e) => {
      log(`🔌 连接关闭 (code=${e.code}, reason=${e.reason})`);
      isConnected.value = false;
      stopHeartbeat();
      ws.value = null;

      // 若非手动关闭则自动重连
      if (!manuallyClosed) tryReconnect();
    };
  };

  // ===============================
  // 4️⃣ 自动重连逻辑
  // ===============================
  const tryReconnect = () => {
    if (reconnectCount.value >= maxReconnectAttempts) {
      log("⚠️ 达到最大重连次数，停止重连");
      return;
    }

    reconnectCount.value++;
    log(`♻️ 尝试第 ${reconnectCount.value} 次重连...`);

    reconnectTimer = window.setTimeout(() => {
      connect();
    }, reconnectInterval);
  };

  // ===============================
  // 5️⃣ 心跳机制
  // ===============================
  const startHeartbeat = () => {
    stopHeartbeat(); // 避免重复启动
    heartbeatTimer = window.setInterval(() => {
      if (isConnected.value && ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: "ping", time: Date.now() }));
        log("💓 发送心跳");
      }
    }, heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  // ===============================
  // 6️⃣ 断网检测（核心增强）
  // ===============================
  const handleOffline = () => {
    log("📴 网络断开");
    isConnected.value = false;

    // 如果当前有连接，先关闭它
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  const handleOnline = () => {
    log("📶 网络恢复，尝试重连...");
    if (!manuallyClosed && !isConnected.value) {
      tryReconnect();
    }
  };

  // 监听浏览器网络状态
  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);

  // ===============================
  // 7️⃣ 发送消息
  // ===============================
  const send = (data: any) => {
    if (isConnected.value && ws.value?.readyState === WebSocket.OPEN) {
      const msg = typeof data === "string" ? data : JSON.stringify(data);
      ws.value.send(msg);
      log("📤 已发送:", msg);
    } else {
      log("⚠️ 无法发送，连接未打开");
    }
  };

  // ===============================
  // 8️⃣ 主动关闭连接
  // ===============================
  const close = (code = 1000, reason = "manual close") => {
    manuallyClosed = true;
    stopHeartbeat();

    if (ws.value) {
      // code 必须合法
      if (code !== 1000 && (code < 3000 || code > 4999)) {
        console.warn("⚠️ close code 不合法，已使用 1000 替代");
        code = 1000;
      }
      ws.value.close(code, reason);
      ws.value = null;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    log("🔒 连接已手动关闭");
  };

  // ===============================
  // 9️⃣ 生命周期清理
  // ===============================
  onUnmounted(() => {
    close();
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  });

  // ===============================
  // 🔟 启动连接
  // ===============================
  connect();

  return {
    ws,
    isConnected,
    error,
    reconnectCount,
    send,
    close,
    connect, // 供外部调用，用于手动重连
  };
}

<script setup lang="ts">
import { useWebSocket } from '../hooks/useWebSocket';

const { isConnected, send, close, reconnectCount, connect } = useWebSocket('ws://localhost:3000', {
    debug: true,
    heartbeatInterval: 4000,
    reconnectInterval: 4000,
});

function sendMsg() {
    send({ type: 'ping', msg: 'Hello WebSocket 👋' });
}


</script>

<template>
    <div>
        <p>连接状态：{{ isConnected ? '🟢 在线' : '🔴 离线' }}</p>
        <p>重连次数：{{ reconnectCount }}</p>
        <el-button @click="sendMsg">发送消息</el-button>
        <el-button @click="() => close()">断开连接</el-button>
        <el-button @click="() => connect()">断开重连</el-button>
    </div>
</template>

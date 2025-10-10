import { h, createApp } from "vue";

let messageQueue: any[] = []; // 存放消息队列

// 用于创建和显示消息的函数
export function MyMessage(options: {
  type?: string;
  message?: string;
  duration?: number;
}) {
  const { type = "info", message, duration = 3000 } = options;

  const app = createApp({
    render() {
      return h(
        "div",
        {
          class: `message-${type}`,
          style: {
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
          },
        },
        "nihao"
      );
    },
  });

  const container = document.createElement("div"); // 创建一个 DOM 容器
  document.body.appendChild(container); // 将容器添加到页面上

  app.mount(container); // 挂载 Vue 实例到该容器上

  // 添加到消息队列
  messageQueue.push({ app, container });

  // 自动销毁消息
  setTimeout(() => {
    app.unmount(); // 卸载 Vue 实例
    document.body.removeChild(container); // 移除 DOM 元素
    messageQueue = messageQueue.filter((item) => item.container !== container); // 从队列中移除
  }, duration);
}

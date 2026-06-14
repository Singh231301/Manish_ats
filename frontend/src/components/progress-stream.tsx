import { useEffect, useState } from "react";

interface Props {
  taskId: string | null;
}

export function ProgressStream({ taskId }: Props) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!taskId) return;
    
    setMessages(["Connecting to AI Engine..."]);
    const eventSource = new EventSource(`http://localhost:4000/api/stream/${taskId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, `> [${new Date().toLocaleTimeString()}] Task status: ${data.status}`]);
        
        if (data.status === "completed" || data.status === "failed") {
          eventSource.close();
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    eventSource.onerror = () => {
      setMessages(prev => [...prev, `> Connection lost or closed.`]);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [taskId]);

  if (!taskId) return null;

  return (
    <div className="progress-stream">
      {messages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
      <div className="animate-pulse">_</div>
    </div>
  );
}

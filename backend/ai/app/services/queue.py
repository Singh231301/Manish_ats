import asyncio
import time
import uuid
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

# In-memory queue state (for MVP, replacing Redis)
TASKS: dict[str, dict] = {}

class TokenBucketRateLimiter:
    def __init__(self, capacity: int, fill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.fill_rate = fill_rate
        self.last_update = time.time()

    def consume(self, tokens: int = 1) -> bool:
        now = time.time()
        elapsed = now - self.last_update
        self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate)
        self.last_update = now

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

# 10 requests per minute
RATE_LIMITER = TokenBucketRateLimiter(capacity=10, fill_rate=10/60)

async def execute_with_backoff(task_fn: Callable[[], Any], max_retries: int = 5):
    for attempt in range(max_retries):
        if RATE_LIMITER.consume():
            try:
                # Assuming task_fn is async
                return await task_fn()
            except Exception as e:
                logger.error(f"Task failed on attempt {attempt}: {e}")
                if attempt == max_retries - 1:
                    raise e
        
        # Exponential backoff
        wait_time = (2 ** attempt) + 0.5
        logger.warning(f"Rate limit hit or task failed. Backing off for {wait_time}s...")
        await asyncio.sleep(wait_time)

async def _worker(task_id: str, task_fn: Callable, *args, **kwargs):
    TASKS[task_id]["status"] = "processing"
    try:
        # Wrap the function in the backoff executor if it hits external APIs
        # For simplicity in this mock, we just run it
        if asyncio.iscoroutinefunction(task_fn):
            result = await execute_with_backoff(lambda: task_fn(*args, **kwargs))
        else:
            result = await execute_with_backoff(lambda: asyncio.to_thread(task_fn, *args, **kwargs))
        
        TASKS[task_id]["status"] = "completed"
        TASKS[task_id]["result"] = result
    except Exception as e:
        TASKS[task_id]["status"] = "failed"
        TASKS[task_id]["error"] = str(e)

def enqueue_task(task_fn: Callable, *args, **kwargs) -> str:
    task_id = str(uuid.uuid4())
    TASKS[task_id] = {
        "status": "queued",
        "result": None,
        "error": None
    }
    # Run in background
    asyncio.create_task(_worker(task_id, task_fn, *args, **kwargs))
    return task_id

def get_task_status(task_id: str) -> dict | None:
    return TASKS.get(task_id)

async def stream_task_progress(task_id: str):
    """Generator for Server-Sent Events (SSE) tracking task progress."""
    while True:
        task = TASKS.get(task_id)
        if not task:
            yield f"data: {{\"status\": \"not_found\"}}\n\n"
            break
            
        status = task["status"]
        yield f"data: {{\"status\": \"{status}\"}}\n\n"
        
        if status in ["completed", "failed"]:
            break
            
        await asyncio.sleep(1.0)

# Task App with SSE

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the server:
```bash
npm start
```

Server runs on `http://localhost:3000`

## n8n Configuration

In your n8n workflow, add an **HTTP Request** node at the end:

**Settings:**
- Method: `POST`
- URL: `http://localhost:3000/api/task-complete`
- Body Content Type: `JSON`

**Body:**
```json
{
  "taskId": "{{ $json.taskId }}",
  "status": "complete"
}
```

Replace `{{ $json.taskId }}` with your actual task identifier if available, or use a static value.

## How It Works

1. Frontend submits task to `https://my-n8n.com/webhook/add-task`
2. Form shows "⏳ Processing..." and is disabled
3. n8n processes task (10-30 seconds)
4. n8n calls `/api/task-complete` webhook
5. Server broadcasts completion via SSE
6. Frontend shows "✅ Complete!" and re-enables form

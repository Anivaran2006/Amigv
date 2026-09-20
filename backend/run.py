import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    # Bind to 0.0.0.0 so Render's port scanner and external router can connect
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)

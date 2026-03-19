import asyncio
from app.db.database import AsyncSessionLocal
from app.api.routes.auth import register
from app.schemas.user import UserCreate

async def do_test():
    try:
        user_in = UserCreate(email="local@test.com", password="password")
        async with AsyncSessionLocal() as db:
            print("Sending query to DB...")
            result = await register(user_in, db)
            print(f"Success: {result.email}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(do_test())

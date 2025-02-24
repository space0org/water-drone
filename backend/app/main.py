from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from .models import DroneCommand, DroneState
from .drone_network import DroneNetwork

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

drone_network = DroneNetwork()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.websocket("/ws/{drone_id}")
async def websocket_endpoint(websocket: WebSocket, drone_id: str):
    await websocket.accept()
    
    # Add drone to network
    drone = drone_network.add_drone(drone_id)
    
    # Start drone simulation loop
    simulation_task = asyncio.create_task(drone.update_loop())
    
    try:
        while True:
            # Receive command from frontend
            data = await websocket.receive_text()
            command = DroneCommand.parse_raw(data)
            
            # Process command
            drone.process_command(command.command, command.value)
            
            # Broadcast state to other drones
            drone_network.broadcast_state(drone_id, drone.state)
            
            # Send updated state (including neighbor states) back to frontend
            await websocket.send_text(drone.state.json())
            
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        drone_network.remove_drone(drone_id)
        simulation_task.cancel()
        try:
            await simulation_task
        except asyncio.CancelledError:
            pass

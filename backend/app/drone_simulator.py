import asyncio
import math
from .models import DroneState, DroneStateMinimal

class DroneSimulator:
    def __init__(self, drone_id: str):
        self.state = DroneState(drone_id=drone_id)
        self._running = True
    
    def process_command(self, command: str, value: float = None):
        if command == "up":
            self.state.depth = max(0, self.state.depth - 0.5)
        elif command == "down":
            self.state.depth = min(100, self.state.depth + 0.5)
        elif command == "surface":
            self.state.depth = 0
        elif command == "forward":
            self.state.speed = min(10, self.state.speed + 0.5)
            # Update position based on direction and speed
            self.state.x += math.cos(math.radians(self.state.direction)) * self.state.speed * 0.1
            self.state.y += math.sin(math.radians(self.state.direction)) * self.state.speed * 0.1
        elif command == "backward":
            self.state.speed = max(-5, self.state.speed - 0.5)
            # Update position based on direction and speed
            self.state.x += math.cos(math.radians(self.state.direction)) * self.state.speed * 0.1
            self.state.y += math.sin(math.radians(self.state.direction)) * self.state.speed * 0.1
        elif command == "left":
            self.state.direction = (self.state.direction - 5) % 360
        elif command == "right":
            self.state.direction = (self.state.direction + 5) % 360
        elif command == "stop":
            self.state.speed = 0
    
    def update_neighbor_state(self, neighbor_id: str, neighbor_state: DroneStateMinimal):
        """Update the state of a neighboring drone"""
        self.state.neighbors[neighbor_id] = neighbor_state
    
    async def update_loop(self):
        while self._running:
            # Simulate battery drain
            self.state.battery = max(0, self.state.battery - 0.01)
            # Simulate temperature fluctuation
            self.state.temperature += (math.sin(asyncio.get_event_loop().time()) * 0.1)
            # Update position based on current speed and direction
            if self.state.speed != 0:
                self.state.x += math.cos(math.radians(self.state.direction)) * self.state.speed * 0.1
                self.state.y += math.sin(math.radians(self.state.direction)) * self.state.speed * 0.1
            await asyncio.sleep(0.1)
    
    def stop(self):
        self._running = False

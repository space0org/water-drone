from pydantic import BaseModel
from typing import Dict, Optional

class DroneStateMinimal(BaseModel):
    drone_id: str
    x: float = 0.0
    y: float = 0.0
    depth: float = 0.0
    speed: float = 0.0
    direction: float = 0.0
    battery: float = 100.0
    temperature: float = 20.0
    connection_status: str = "connected"

class DroneState(DroneStateMinimal):
    neighbors: Dict[str, DroneStateMinimal] = {} # States of nearby drones

class DroneCommand(BaseModel):
    drone_id: str
    command: str  # up, down, left, right, forward, backward, stop, surface
    value: Optional[float] = None  # For speed/direction adjustments

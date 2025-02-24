from typing import Dict, Optional
from .models import DroneState, DroneStateMinimal
from .drone_simulator import DroneSimulator

class DroneNetwork:
    def __init__(self):
        self.drones: Dict[str, DroneSimulator] = {}
        
    def add_drone(self, drone_id: str) -> DroneSimulator:
        """Add a new drone to the network"""
        if drone_id not in self.drones:
            self.drones[drone_id] = DroneSimulator(drone_id)
        return self.drones[drone_id]
    
    def remove_drone(self, drone_id: str):
        """Remove a drone from the network"""
        if drone_id in self.drones:
            self.drones[drone_id].stop()
            del self.drones[drone_id]
    
    def get_drone(self, drone_id: str) -> Optional[DroneSimulator]:
        """Get a drone by ID"""
        return self.drones.get(drone_id)
    
    def broadcast_state(self, from_drone_id: str, state: DroneState):
        """Broadcast drone state to all other drones within range"""
        sender = self.drones.get(from_drone_id)
        if not sender:
            return
            
        # Create minimal state for broadcasting
        minimal_state = DroneStateMinimal(
            drone_id=state.drone_id,
            x=state.x,
            y=state.y,
            depth=state.depth,
            speed=state.speed,
            direction=state.direction,
            battery=state.battery,
            temperature=state.temperature,
            connection_status=state.connection_status
        )
            
        # Simulate range-based communication (100m range)
        for drone_id, drone in self.drones.items():
            if drone_id != from_drone_id:
                # Calculate distance between drones
                dx = sender.state.x - drone.state.x
                dy = sender.state.y - drone.state.y
                dz = sender.state.depth - drone.state.depth
                distance = (dx * dx + dy * dy + dz * dz) ** 0.5
                
                # If within range, update neighbor state
                if distance <= 100:
                    drone.update_neighbor_state(from_drone_id, minimal_state)

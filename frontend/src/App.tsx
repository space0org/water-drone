import { useEffect, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlertTriangle, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { nanoid } from 'nanoid';

interface DroneState {
  drone_id: string;
  x: number;
  y: number;
  depth: number;
  speed: number;
  direction: number;
  battery: number;
  temperature: number;
  connection_status: string;
  neighbors: Record<string, DroneState>;
}

function App() {
  const [drones, setDrones] = useState<Map<string, { ws: WebSocket | null, state: DroneState }>>(new Map());
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [sensorHistory, setSensorHistory] = useState<Record<string, DroneState[]>>({});

  const addDrone = () => {
    const droneId = nanoid();
    const websocket = new WebSocket(`wss://app-cygwaklr.fly.dev/ws/${droneId}`);
    
    websocket.onopen = () => {
      console.log(`Connected drone ${droneId}`);
      setDrones(prev => {
        const newDrones = new Map(prev);
        newDrones.set(droneId, {
          ws: websocket,
          state: {
            drone_id: droneId,
            x: 0,
            y: 0,
            depth: 0,
            speed: 0,
            direction: 0,
            battery: 100,
            temperature: 20,
            connection_status: 'connected',
            neighbors: {}
          }
        });
        return newDrones;
      });
      setSelectedDroneId(droneId);
    };
    
    websocket.onmessage = (event) => {
      const newState = JSON.parse(event.data);
      setDrones(prev => {
        const newDrones = new Map(prev);
        const drone = newDrones.get(droneId);
        if (drone) {
          drone.state = newState;
        }
        return newDrones;
      });
      setSensorHistory(prev => ({
        ...prev,
        [droneId]: [...(prev[droneId] || []).slice(-50), newState]
      }));
    };
    
    websocket.onclose = () => {
      console.log(`Disconnected drone ${droneId}`);
      setDrones(prev => {
        const newDrones = new Map(prev);
        newDrones.delete(droneId);
        return newDrones;
      });
      if (selectedDroneId === droneId) {
        setSelectedDroneId(null);
      }
    };
  };

  useEffect(() => {
    // Add initial drone
    if (drones.size === 0) {
      addDrone();
    }
    
    return () => {
      // Cleanup all WebSocket connections
      drones.forEach(drone => {
        if (drone.ws) {
          drone.ws.close();
        }
      });
    };
  }, []);

  const sendCommand = (command: string, value?: number) => {
    if (selectedDroneId) {
      const drone = drones.get(selectedDroneId);
      if (drone?.ws) {
        drone.ws.send(JSON.stringify({ 
          drone_id: selectedDroneId,
          command, 
          value 
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">水中ドローン制御システム</h1>
          <Button onClick={addDrone}><Plus className="mr-2" /> 新規ドローン追加</Button>
        </div>

        {/* Drone Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ドローン選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Array.from(drones.entries()).map(([id]) => (
                <Button 
                  key={id}
                  variant={selectedDroneId === id ? "default" : "outline"}
                  onClick={() => setSelectedDroneId(id)}
                >
                  ドローン {id.slice(0, 4)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {selectedDroneId && drones.get(selectedDroneId) && (
          <>
            {/* Status Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>ドローンステータス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">深度</p>
                    <p className="text-2xl font-bold">{drones.get(selectedDroneId)!.state.depth.toFixed(1)}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">速度</p>
                    <p className="text-2xl font-bold">{drones.get(selectedDroneId)!.state.speed.toFixed(1)}m/s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">バッテリー</p>
                    <p className="text-2xl font-bold">{drones.get(selectedDroneId)!.state.battery.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">水温</p>
                    <p className="text-2xl font-bold">{drones.get(selectedDroneId)!.state.temperature.toFixed(1)}°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Neighbor Status */}
            {Object.entries(drones.get(selectedDroneId)!.state.neighbors).length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>近隣ドローン</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(drones.get(selectedDroneId)!.state.neighbors).map(([neighborId, state]) => (
                      <div key={neighborId} className="p-4 border rounded">
                        <h3 className="font-bold mb-2">ドローン {neighborId.slice(0, 4)}</h3>
                        <p>距離: {(
                          Math.sqrt(
                            Math.pow(state.x - drones.get(selectedDroneId)!.state.x, 2) +
                            Math.pow(state.y - drones.get(selectedDroneId)!.state.y, 2) +
                            Math.pow(state.depth - drones.get(selectedDroneId)!.state.depth, 2)
                          )
                        ).toFixed(1)}m</p>
                        <p>深度: {state.depth.toFixed(1)}m</p>
                        <p>速度: {state.speed.toFixed(1)}m/s</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>移動制御</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 max-w-[300px] mx-auto">
                <div></div>
                <Button onClick={() => sendCommand('forward')}><ArrowUp /></Button>
                <div></div>
                <Button onClick={() => sendCommand('left')}><ArrowLeft /></Button>
                <Button onClick={() => sendCommand('stop')}>停止</Button>
                <Button onClick={() => sendCommand('right')}><ArrowRight /></Button>
                <div></div>
                <Button onClick={() => sendCommand('backward')}><ArrowDown /></Button>
                <div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>深度制御</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 items-center">
                <Button onClick={() => sendCommand('up')}><ArrowUp /> 上昇</Button>
                <Button onClick={() => sendCommand('down')}><ArrowDown /> 下降</Button>
                <Button 
                  variant="destructive" 
                  onClick={() => sendCommand('surface')}
                  className="w-full"
                >
                  <AlertTriangle className="mr-2" /> 緊急浮上
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensor History */}
        <Card>
          <CardHeader>
            <CardTitle>センサー履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={800} height={300} data={sensorHistory[selectedDroneId] || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="depth" stroke="#8884d8" name="深度 (m)" />
              <Line type="monotone" dataKey="temperature" stroke="#82ca9d" name="水温 (°C)" />
              <Line type="monotone" dataKey="battery" stroke="#ffc658" name="バッテリー (%)" />
            </LineChart>
          </CardContent>
        </Card>
      </>
    )}
  </div>
</div>
);
}

export default App;

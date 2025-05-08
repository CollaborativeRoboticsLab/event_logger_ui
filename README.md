# Capabilities2 UI

A Node.js + React-based web application that connects to [`foxglove-rosbridge`](https://github.com/foxglove/ros-foxglove-bridge) and visualizes `/events` messages published in ROS2 using the CDR encoding format.

This app allows:
- Live real-time visualization of capability events
- Storage of incoming events in MongoDB
- Modular CDR decoding for easy support of new message types and topics
- REST API for historical data access


## 🚀 How to Run

### 1. Prerequisites

- Node.js ≥ 18.x
- MongoDB (running locally or via Atlas)
- ROS2 Capabilities2 system publishing to `/events` via [foxglove-bridge](https://github.com/foxglove/ros-foxglove-bridge)

### 2. Clone and Setup

```bash
git clone https://github.com/CollaborativeRoboticsLab/capabilities2-ui.git
cd capabilities2-ui
```

### 3. Backend

```bash
cd backend
npm install

# Setup MongoDB URI
echo "MONGO_URI=mongodb://localhost:27017/capabilities2" > .env

# Start the backend (REST API + WebSocket + Foxglove client)
node server.js
```

### 4. Frontend

```bash
cd ../frontend
npm install
npm start
```

Then visit: [http://localhost:3000](http://localhost:3000)

## Adding New Topics

To add support for another ROS2 topic:

1. Create a decoder under `backend/decoders/yourDecoder.js`
2. Implement decoding logic using `CdrReader`
3. Register it in `decoders/index.js` as 

```js
"/your/topic": require("./yourDecoder")
```


## API Endpoints

| Method | URL         | Description                    |
| ------ | ----------- | ------------------------------ |
| GET    | /api/events | List all stored events         |
| POST   | /api/events | Add new event (manual testing) |


## Credits

* [Foxglove WebSocket Protocol](https://foxglove.dev/docs/websocket)
* [@foxglove/cdr](https://www.npmjs.com/package/@foxglove/cdr)
* ROS2 + DDS community for message protocols

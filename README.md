# Event Logger UI

A Node.js + React-based web application that connects to [`foxglove-rosbridge`](https://github.com/foxglove/ros-foxglove-bridge) and visualizes `/events` messages published in ROS2 using the CDR encoding format.

This app allows:
- Live real-time visualization of capability events
- Storage of incoming events in MongoDB
- Modular CDR decoding for easy support of new message types and topics
- REST API for historical data access


## Prerequisites

- Node.js ≥ 18.x
- MongoDB (running locally or via Atlas)
- ROS2 Capabilities2 system publishing to `/events` via [foxglove-bridge](https://github.com/foxglove/ros-foxglove-bridge)

## Clone and Setup

```bash
git clone https://github.com/CollaborativeRoboticsLab/event_logger_ui.git
cd event_logger_ui
```

## Docker based Deployment

Make sure you have docker installed. Then,

```sh
docker compose up
```

## Pure Deployment

### Backend

If you want to modify or start the backend seperately, run following commands

```bash
cd backend
npm install

# Setup MongoDB URI
echo "MONGO_URI=mongodb://localhost:27017/event_logger" > .env

# Start the backend (REST API + WebSocket + Foxglove client)
node server.js
```

If the backend does not start properly (fails to connect with mongodb) run the following commands

```sh
sudo rm -f /tmp/mongodb-27017.sock
sudo systemctl start mongod
sudo systemctl status mongod
```

and then retry the server

```sh
node server.js
```


### Frontend

If you want to modify or start the backend seperately, run following commands

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

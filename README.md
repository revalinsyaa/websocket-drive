# WebSocket Server and Client

## Setup

1. Install dependencies:
```
npm install
```

2. Start the WebSocket server:
```
npm start
```
The server will run on `ws://192.168.1.21:8000`.

## Client

Open the `client.html` file in a web browser that can access the server IP address.

## Usage

- The client connects to the WebSocket server.
- Type a command in the input box and click "Send".
- The server executes the command and sends back the output or success message.
- Connection status and messages are displayed in the client.

## Notes

- Ensure your firewall or network settings allow connections to port 8000.
- The server executes commands received from clients, so be cautious about security risks.

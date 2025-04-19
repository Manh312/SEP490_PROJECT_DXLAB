import { getSignalRConnection } from "./connection";

export const registerSignalREvent = (hubName, eventName, callback) => {
  const connection = getSignalRConnection(hubName);
  if (connection) {
    if (connection.state === "Connected") {
      connection.on(eventName, (...args) => {
        console.log(`Received event ${eventName} on ${hubName}:`, args);
        callback(...args);
      });
      console.log(`Registered SignalR event: ${eventName} on ${hubName}`);
    } else {
      console.warn(`SignalR connection for ${hubName} is not in Connected state. Current state: ${connection.state}`);
    }
  } else {
    console.error(`SignalR connection not established for ${hubName}. Cannot register event: ${eventName}`);
  }
};

export const unregisterSignalREvent = (hubName, eventName) => {
  const connection = getSignalRConnection(hubName);
  if (connection) {
    connection.off(eventName);
    console.log(`Unregistered SignalR event: ${eventName} on ${hubName}`);
  } else {
    console.log(`No connection found for ${hubName}. Cannot unregister event: ${eventName}`);
  }
};
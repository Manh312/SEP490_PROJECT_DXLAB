import { getSignalRConnection } from "./connection";

export const sendSignalRMessage = async (hubName, methodName, ...args) => {
  const connection = getSignalRConnection(hubName);
  if (!connection) {
    throw new Error(`No active SignalR connection for ${hubName}`);
  }

  if (connection.state !== "Connected") {
    throw new Error(`SignalR connection for ${hubName} is not connected (state: ${connection.state})`);
  }

  try {
    await connection.invoke(methodName, ...args);
    console.log(`SignalR Message Sent to ${hubName}: ${methodName}`, args);
  } catch (err) {
    console.error(`SignalR Invoke Error (${hubName}, ${methodName}):`, err);
    throw new Error(`Failed to send message to ${hubName}: ${err.message}`);
  }
};
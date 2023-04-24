const signalR = require('@microsoft/signalr');
const axios = require('axios');

export default function GraffleSDK(clientConfig, isTestNet = false) {
  let negotiateResult;
  let connection = null;

  const negotiate = async () => {
    const authHeader = {
      'graffle-api-key': clientConfig.apiKey
    }

    const url = isTestNet ?
      'https://prod-test-net-api-manager.azure-api.net/test-net-livestream/api/negotiateLiveStream' :
      'https://api.graffle.io/main-net-livestream/api/negotiateLiveStream';

    negotiateResult = await axios.post(
      url, {}, { headers: authHeader }
    );
  };

  this.stream = async (streamCallback) => {
    await negotiate();
    connection = new signalR.HubConnectionBuilder()
      .withUrl(negotiateResult.data.url, {
        accessTokenFactory: () => negotiateResult.data.accessToken,
      })
      .withAutomaticReconnect()
      .build();

    if (connection) {
      connection.start().then((result) => {
        connection.on(clientConfig.projectId, (message) => {
          var parsedMessage = JSON.parse(message);
          streamCallback(parsedMessage);
        });
      });
    }
  };

  this.disconnect = () => {
    if (connection) {
      console.log("Disconnecting from SignalR hub...")
      connection.stop();
      connection = null;
    }
  }
}

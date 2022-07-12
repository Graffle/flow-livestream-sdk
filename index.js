const signalR = require('@microsoft/signalr');
const axios = require('axios');

export default function GraffleSDK(clientConfig, isTestNet = false) {
  let negotiateResult;

  const negotiate = async () => {
    const authHeader = {
      'graffle-api-key': isTestNet ? clientConfig.testNetApiKey : clientConfig.mainNetApiKey
    }

    const url = isTestNet ?
    'https://prod-test-net-api-manager.azure-api.net/test-net-livestream/api/negotiateLiveStream' :
    'https://prod-main-net-api-manager.azure-api.net/main-net-livestream/api/negotiateLiveStream';
    
    negotiateResult = await axios.post(
      url, {}, {headers: authHeader}
    );    
  };

  this.stream = async (streamCallback) => {
    await negotiate();
    const connection = new signalR.HubConnectionBuilder()
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
}

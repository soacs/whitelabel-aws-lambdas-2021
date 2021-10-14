const mockAllocationData = require('./mockAllocationData.js');
const mockAllocationDetailData = require('./mockAllocationDetailData.js');
const mockMarketData = require('./mockMarketData.js');
const mockOptionChainData = require('./mockOptionChainData.js');
const mockTradeViewData = require('./mockTradeViewData.js');

exports.handler = async (event) => {
    let mockData;
    console.log('mockAgGrigAllocationData', event.pathParameters.proxy);
    switch (event.pathParameters.proxy) {
      case 'allocations-data':
        mockData = mockAllocationData.mockAllocationData;
        break;
      case 'allocations-detail-data':
        mockData = mockAllocationDetailData.mockAllocationDetailData;
        break;
      case 'market-data':
        mockData = mockMarketData.mockMarketData;
        break;
      case 'option-chain-data':
        mockData = mockOptionChainData.mockOptionChainData;
        break;
      case 'trade-view-data':
        mockData = mockTradeViewData.mockTradeViewData;
        break;
      case 'trade-view-small-data':
        mockData = mockTradeViewData.mockTradeViewSmallData;
        break;
      case 'trade-view-children-data':
        mockData = mockTradeViewData.mockTradeViewChildrenData;
        break;
      case 'trade-view-cancel-order-data':
        mockData = mockTradeViewData.mockTradeViewCancelOrderData;
        break;
      default:
         mockData = mockTradeViewData.mockTradeViewData;
    }
    
  
    const response = {
        statusCode: 200,
        headers: {
         "Access-Control-Allow-Origin" : "*",
         "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token;ao-token",
         "Content-Type":"application/json",
         "Access-Control-Allow-Methods" : "GET,POST,OPTIONS,PUT,DELETE"
        },
        body: JSON.stringify(mockData)
    };
    return response;
};

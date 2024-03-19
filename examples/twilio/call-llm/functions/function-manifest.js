// create metadata for all the available functions to pass to completions API
const tools = [
  {
    type: 'function',
    function: {
      name: 'checkInventory',
      say: 'Let me check our inventory right now.',
      description: 'Check the inventory of airpods, airpods pro or airpods max.',
      parameters: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            'enum': ['airpods', 'airpods pro', 'airpods max'],
            description: 'The model of airpods, either the airpods, airpods pro or airpods max',
          },
        },
        required: ['model'],
      },
      returns: {
        type: 'object',
        properties: {
          stock: {
            type: 'integer',
            description: 'An integer containing how many of the model are in currently in stock.'
          }
        }
      }
    },
  },
  {
    type: 'function',
    function: {
      name: 'checkPrice',
      say: 'Let me check the price, one moment.',
      description: 'Check the price of given model of airpods, airpods pro or airpods max.',
      parameters: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            'enum': ['airpods', 'airpods pro', 'airpods max'],
            description: 'The model of airpods, either the airpods, airpods pro or airpods max',
          },
        },
        required: ['model'],
      },
      returns: {
        type: 'object',
        properties: {
          price: {
            type: 'integer',
            description: 'the price of the model'
          }
        }
      }
    },
  },
  {
    type: 'function',
    function: {
      name: 'placeOrder',
      say: 'All right, I\'m just going to ring that up in our system.',
      description: 'Places an order for a set of airpods.',
      parameters: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            'enum': ['airpods', 'airpods pro'],
            description: 'The model of airpods, either the regular or pro',
          },
          quantity: {
            type: 'integer',
            description: 'The number of airpods they want to order',
          },
        },
        required: ['type', 'quantity'],
      },
      returns: {
        type: 'object',
        properties: {
          price: {
            type: 'integer',
            description: 'The total price of the order including tax'
          },
          orderNumber: {
            type: 'integer',
            description: 'The order number associated with the order.'
          }
        }
      }
    },
  },
  {
    type: 'function',
    function: {
      name: 'transferCall',
      say: 'One moment while I transfer your call.',
      description: 'Transfers the customer to a live agent in case they request help from a real person.',
      parameters: {
        type: 'object',
        properties: {
          callSid: {
            type: 'string',
            description: 'The unique identifier for the active phone call.',
          },
        },
        required: ['callSid'],
      },
      returns: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Whether or not the customer call was successfully transfered'
          },
        }
      }
    },
  },
];

module.exports = tools;
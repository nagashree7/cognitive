const axios = require('axios');

module.exports = async function (context, req) {
  const searchQuery = req.query.search || (req.body && req.body.search);
  const searchEndpoint = process.env.SEARCH_ENDPOINT;
  const searchApiKey = process.env.SEARCH_API_KEY;
  const indexName = "your-index";  // Replace with your index name
  
  const url = `${searchEndpoint}/indexes/${indexName}/docs?search=${searchQuery}&api-key=${searchApiKey}`;

  try {
    const response = await axios.get(url);
    context.res = {
      status: 200,
      body: response.data
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};

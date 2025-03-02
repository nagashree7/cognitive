const axios = require('axios');

module.exports = async function (context, req) {
  const text = req.query.text || (req.body && req.body.text);
  const apiKey = process.env.TRANSLATOR_API_KEY;
  const region = process.env.TRANSLATOR_REGION;
  const targetLanguage = 'fr'; // Translate to French

  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLanguage}`;
  
  try {
    const response = await axios.post(url, [{
      Text: text
    }], {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
      }
    });

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

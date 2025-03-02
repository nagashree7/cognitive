import React, { useState } from 'react';


function App() {
  const [speechText, setSpeechText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Handle Speech Recognition using Azure Cognitive Services
  const handleSpeechRecognition = () => {
    const SpeechSDK = window.SpeechSDK;

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      process.env.REACT_APP_SPEECH_API_KEY, 
      process.env.REACT_APP_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(result => {
      setSpeechText(result.text);
    });
  };

  // Handle Text Translation using Azure Translator
  const handleTranslation = async () => {
    const response = await fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=fr', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.REACT_APP_TRANSLATOR_API_KEY,
        'Ocp-Apim-Subscription-Region': process.env.REACT_APP_TRANSLATOR_REGION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ Text: speechText }])
    });
    const data = await response.json();
    setTranslatedText(data[0].translations[0].text);
  };

  // Handle Search using Azure Cognitive Search
  const handleSearch = async () => {
    const response = await fetch(`${process.env.REACT_APP_SEARCH_ENDPOINT}/indexes/your-index/docs?api-key=${process.env.REACT_APP_SEARCH_API_KEY}&search=${speechText}`);
    const data = await response.json();
    setSearchResults(data.value);
  };

  return (
    <div className="App">
      <h1>Azure Cognitive Services Demo</h1>
      <button onClick={handleSpeechRecognition}>Start Speech Recognition</button>
      <p>{speechText}</p>
      <button onClick={handleTranslation}>Translate Text</button>
      <p>{translatedText}</p>
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((result, index) => (
          <li key={index}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

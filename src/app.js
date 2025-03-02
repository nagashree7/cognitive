import React, { useState } from 'react';

function App() {
  const [speechText, setSpeechText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null); // for error handling
  const [manualInput, setManualInput] = useState(''); // input text from user manually

  // Handle Speech Recognition using Azure Cognitive Services
  const handleSpeechRecognition = () => {
    try {
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
      }, (err) => {
        setError(`Speech Recognition failed: ${err}`);
      });
    } catch (err) {
      setError(`Speech Recognition failed: ${err.message}`);
    }
  };

  // Handle Text Translation using Azure Translator
  const handleTranslation = async () => {
    try {
      const textToTranslate = manualInput || speechText; // use speechText or manualInput if available

      if (!textToTranslate) {
        setError('Please provide some text to translate.');
        return;
      }

      const response = await fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=fr', {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.REACT_APP_TRANSLATOR_API_KEY,
          'Ocp-Apim-Subscription-Region': process.env.REACT_APP_TRANSLATOR_REGION,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ Text: textToTranslate }])
      });

      if (!response.ok) {
        throw new Error('Translation API failed');
      }

      const data = await response.json();
      setTranslatedText(data[0].translations[0].text);
    } catch (err) {
      setError(`Translation failed: ${err.message}`);
    }
  };

  // Handle Search using Azure Cognitive Search
  const handleSearch = async () => {
    try {
      const textToSearch = manualInput || speechText; // use speechText or manualInput if available

      if (!textToSearch) {
        setError('Please provide text for search.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SEARCH_ENDPOINT}/indexes/your-index/docs?api-key=${process.env.REACT_APP_SEARCH_API_KEY}&search=${textToSearch}`);
      
      if (!response.ok) {
        throw new Error('Search API failed');
      }

      const data = await response.json();
      setSearchResults(data.value);
    } catch (err) {
      setError(`Search failed: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <h1>Azure Cognitive Services Demo</h1>

      {/* Speech Recognition Button */}
      <button onClick={handleSpeechRecognition}>Start Speech Recognition</button>
      <p>{speechText}</p>

      {/* Manual Text Input for Translation and Search */}
      <div>
        <label htmlFor="manualInput">Enter Text for Translation or Search:</label>
        <input
          type="text"
          id="manualInput"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)} // update manualInput
        />
      </div>

      {/* Translation Button */}
      <button onClick={handleTranslation}>Translate Text</button>
      <p>{translatedText}</p>

      {/* Search Button */}
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((result, index) => (
          <li key={index}>{result.title}</li>
        ))}
      </ul>

      {/* Display error messages */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default App;

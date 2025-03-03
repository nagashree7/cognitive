import React, { useState } from 'react';

function App() {
  const [speechText, setSpeechText] = useState(''); // for speech recognition result
  const [manualInput, setManualInput] = useState(''); // for manual text input
  const [translatedText, setTranslatedText] = useState(''); // for translation result
  const [searchResults, setSearchResults] = useState([]); // for search results
  const [error, setError] = useState(null); // for error handling
  const [selectedLanguage, setSelectedLanguage] = useState('fr'); // selected translation language
  
  // Language options for translation
  const languages = [
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    // Add more languages as needed
  ];

  // Handle Speech Recognition using Azure Cognitive Services
  const handleSpeechRecognition = () => {
    try {
      const SpeechSDK = window.SpeechSDK;
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        process.env.REACT_APP_SPEECH_API_KEY, 
        process.env.REACT_APP_SPEECH_REGION
      );
      speechConfig.speechRecognitionLanguage = 'en-US'; // adjust language as needed
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync(result => {
        setSpeechText(result.text); // update the speechText with recognized speech
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
      const textToTranslate = manualInput || speechText; // use speechText or manualInput

      if (!textToTranslate) {
        setError('Please provide some text to translate.');
        return;
      }

      const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${selectedLanguage}`, {
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
      setTranslatedText(data[0].translations[0].text); // display the translated text
    } catch (err) {
      setError(`Translation failed: ${err.message}`);
    }
  };

  // Handle Search using Azure Cognitive Search
  const handleSearch = async () => {
    try {
      const textToSearch = manualInput || speechText; // use speechText or manualInput

      if (!textToSearch) {
        setError('Please provide text for search.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SEARCH_ENDPOINT}/indexes/your-index/docs?api-key=${process.env.REACT_APP_SEARCH_API_KEY}&search=${textToSearch}`);
      
      if (!response.ok) {
        throw new Error('Search API failed');
      }

      const data = await response.json();
      setSearchResults(data.value); // set the search results
    } catch (err) {
      setError(`Search failed: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <h1>Azure Cognitive Services Demo</h1>

      {/* Speech Recognition Section */}
      <div>
        <button onClick={handleSpeechRecognition}>Start Speech Recognition</button>
        <p><strong>Recognized Speech:</strong></p>
        <textarea value={speechText} readOnly rows="4" cols="50" /> {/* Show recognized speech in block */}
      </div>

      {/* Translation Section */}
      <div>
        <label htmlFor="manualInput">Enter Text for Translation:</label>
        <input
          type="text"
          id="manualInput"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)} // update manualInput
          placeholder="Enter text to translate"
        />

        <div>
          <label htmlFor="languageSelect">Select Target Language:</label>
          <select
            id="languageSelect"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)} // update selected language
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleTranslation}>Translate Text</button>

        {translatedText && (
          <div>
            <p><strong>Translated Text:</strong></p>
            <p>{translatedText}</p>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div>
        <label htmlFor="searchInput">Enter Text for Search:</label>
        <input
          type="text"
          id="searchInput"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)} // update manualInput
          placeholder="Enter text to search"
        />
        <button onClick={handleSearch}>Search</button>

        {searchResults.length > 0 && (
          <div>
            <p><strong>Search Results:</strong></p>
            <ul>
              {searchResults.map((result, index) => (
                <li key={index}>{result.title}</li> // Assuming the search result has a 'title' property
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Display error messages */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default App;

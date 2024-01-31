import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'regenerator-runtime/runtime';
import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { FormField, Loader } from '../components';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import ImageEditor from './ImageEditor';

const CreatePost = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photo: '',
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [speech, setSpeech] = useState("");
  const svgStyle = { fill: '#ff0000' };
  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  if (!browserSupportsSpeechRecognition) {
    return null
  }

  const handleButtonClick = () => {
    if (isListening) {
      SpeechRecognition.stopListening
    } else {
      startListening();
    }
  };

  const generateImage = async () => {
    if (form.prompt || speech) {
      try {
        setGeneratingImg(true);
        const response = await fetch('http://localhost:8080/api/v1/dalle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: form.prompt || speech
          }),
        });

        const data = await response.json();
        setForm({ ...form, photo: `data:image/jpeg;base64,${data.photo}` });
      } catch (error) {
        alert(error);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert('Please enter a prompt');
    }
  };

  // const generatevImage = async () => {
  //   if (speech) {
  //     try {
  //       setGeneratingImg(true);
  //       const response = await fetch('http://localhost:8080/api/v1/dalle', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           prompt: speech,
  //         }),
  //       });

  //       const data = await response.json();
  //       setForm({ ...form, photo: `data:image/jpeg;base64,${data.photo}` });
  //     } catch (error) {
  //       alert(error);
  //     } finally {
  //       setGeneratingImg(false);
  //     }
  //   } else {
  //     alert('Please enter a prompt');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.prompt || speech && form.photo) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/v1/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });

        response.json();
        alert('Success');
        navigate('/');
      } catch (err) {
        alert(err);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please generate an image with proper details');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  }

  useEffect(() => {
    setSpeech(transcript);
  }, [transcript]);

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">Generate an imaginative and visually stunning image through Noori AI and share it with the community</p>
      </div>

      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <FormField
            labelName="Your Name"
            type="text"
            name="name"
            placeholder="Ex., john doe"
            value={form.name}
            handleChange={handleChange}
          />
          <div>
            <FormField
              labelName="Text Prompt"
              type="text"
              name="prompt"
              placeholder="an armchair in the shape of an avocado"
              value={form.prompt || speech}
              handleChange={handleChange}
              isSurpriseMe
              handleSurpriseMe={handleSurpriseMe} />
            <div className="flex my-4 gap-4">
              <button onClick={handleButtonClick} type="button" alt='start'>
                <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 384 512">
                  <path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z" />
                </svg>
              </button>
              <button onClick={SpeechRecognition.stopListening} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 640 512" style={svgStyle}>
                  <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 21.2-5.1 41.1-14.2 58.7L416 300.8V96c0-53-43-96-96-96s-96 43-96 96v54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128v-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6v40c0 89.1 66.2 162.7 152 174.4V464H248c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H344V430.4z" />
                </svg>
              </button>
              <div className="mt-1 flex gap-5">
                <button
                  type="button"
                  onClick={generateImage}
                  className=" text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                  {generatingImg ? 'Generating...' : 'Generate'}
                </button>
                <button type="button" className=" text-red bg-slate-300 font-medium rounded-md text-sm w-full sm:w-auto px-4 py-2 text-center"
                  onClick={resetTranscript}>Reset</button>
              </div>
            </div>

          </div>

          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.prompt}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-9/12 h-9/12 object-contain opacity-40"
              />
            )}
            {generatingImg && (
              <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                <Loader />
              </div>
            )}
          </div>
        </div>
        {form.photo && <ImageEditor generatedImage={form.photo} />}
        <div className="mt-2">
          <p className="mt-2 text-[#666e75] text-[14px]">** Once you have created the image you want, you can share it with others in the community **</p>
          <button
            type="submit"
            className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? 'Sharing...' : 'Share with the Community'}
          </button>
        </div>

      </form>
    </section >
  )
}

export default CreatePost
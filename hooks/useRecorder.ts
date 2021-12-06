import {useEffect, useState} from 'react';

import {saveRecording, startRecording} from './../handlers/recorderControls';
import {AudioTrack, Interval, MediaRecorderEvent, Recorder} from './../types';

const initialState: Recorder = {
	recordingMinutes: 0,
	recordingSeconds: 0,
	initRecording: false,
	mediaStream: null, // streaming from user
	mediaRecorder: null, // record, taken from mediaStream
	audio: null,
};

export default function useRecorder() {
	const [recorderState, setRecorderState] = useState<Recorder>(initialState);

	// INIT RECORDING
	useEffect(() => {
		const MAX_RECORDER_TIME = 5;
		let recordingInterval: Interval = null;

		if (recorderState.initRecording)
			recordingInterval = setInterval(() => {
				setRecorderState((prevState: Recorder) => {
					if (
						prevState.recordingMinutes === MAX_RECORDER_TIME &&
						prevState.recordingSeconds === 0
					) {
						typeof recordingInterval === 'number' &&
							clearInterval(recordingInterval);
						return prevState;
					}

					if (
						prevState.recordingSeconds >= 0 &&
						prevState.recordingSeconds < 59
					)
						return {
							...prevState,
							recordingSeconds: prevState.recordingSeconds + 1,
						};
					else if (prevState.recordingSeconds === 59)
						return {
							...prevState,
							recordingMinutes: prevState.recordingMinutes + 1,
							recordingSeconds: 0,
						};
					else return prevState;
				});
			}, 1000);
		else
			typeof recordingInterval === 'number' && clearInterval(recordingInterval);

		return () => {
			typeof recordingInterval === 'number' && clearInterval(recordingInterval);
		};
	});

	// UPDATE MEDIASTREAM STATE ON RECORDING
	useEffect(() => {
		setRecorderState((prevState) => {
			if (prevState.mediaStream)
				return {
					...prevState,
					mediaRecorder: new MediaRecorder(prevState.mediaStream),
				};
			else return prevState;
		});
	}, [recorderState.mediaStream]);

	// CONVERT MEDIARECORD TO AUDIO
	useEffect(() => {
		const recorder = recorderState.mediaRecorder;
		let chunks: Blob[] = [];

		// MediaRecord Init
		if (recorder && recorder.state === 'inactive') {
			// Begin record
			recorder.start();

			// Create Blob Chunks on changing stream's state
			recorder.ondataavailable = (e: MediaRecorderEvent) => {
				chunks.push(e.data);
			};

			// Save audio on stop
			recorder.onstop = () => {
				const blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'});
				chunks = [];

				setRecorderState((prevState: Recorder) => {
					if (prevState.mediaRecorder)
						return {
							...initialState,
							audio: window.URL.createObjectURL(blob),
						};
					else return initialState;
				});
			};
		}

		// Stop recording on exit
		return () => {
			if (recorder)
				recorder.stream
					.getAudioTracks()
					.forEach((track: AudioTrack) => track.stop());
		};
	}, [recorderState.mediaRecorder]);

	return {
		recorderState,
		audioControllers: {
			startRecording: () => startRecording(setRecorderState),
			cancelRecording: () => setRecorderState(initialState),
			saveRecording: () => saveRecording(recorderState.mediaRecorder),
		},
	};
}

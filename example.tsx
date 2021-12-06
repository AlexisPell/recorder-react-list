import { UploadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useEffect, useRef } from 'react';
import { v4 } from 'uuid';

import useRecordingsList from './hooks/useRecordingsList';
import useRecorder from './hooks/useRecorder';

interface SoundModalProps {}
export const SoundModal: React.FC<SoundModalProps> = ({}) => {
	const { recorderState, audioControllers } = useRecorder();
	const { audio } = recorderState;
	const { recordings, deleteAudio } = useRecordingsList(audio);
	console.log('🚀 ~ file: soundModal.tsx ~ line 24 ~ recordings', recordings);

	useEffect(() => {
		console.log('🚀 ~ file: soundModal.tsx ~ line 20 ~ audio', recorderState);
	}, [recorderState.initRecording, recorderState.recordingMinutes, recorderState.recordingSeconds]);

	const currAudio = useRef<HTMLAudioElement | null>(null);

	return (
		<div>
			<Button onClick={audioControllers.startRecording}>Start record</Button>
			<Button onClick={audioControllers.saveRecording}>Save record</Button>
			<Button onClick={audioControllers.cancelRecording}>Cancel record</Button>
			<h3>Recordings list:</h3>
			{recordings.map((record) => (
				<div>
					<audio controls src={record.audio} ref={currAudio} />
					<Button onClick={() => deleteAudio(record.key)}>Delete record</Button>
				</div>
			))}
		</div>
	);
};

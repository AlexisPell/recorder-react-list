import {useEffect, useState} from 'react';

import {deleteAudio} from './../handlers/recordingsList';
import {Audio} from './../types';
import {generateKey} from './../utils/generateKey';

export default function useRecordingsList(audio: string | null) {
	const [recordings, setRecordings] = useState<Audio[]>([]);

	useEffect(() => {
		if (audio)
			setRecordings((prevState: Audio[]) => {
				return [...prevState, {key: generateKey(), audio}];
			});
	}, [audio]);

	return {
		recordings,
		deleteAudio: (audioKey: string) => deleteAudio(audioKey, setRecordings),
	};
}

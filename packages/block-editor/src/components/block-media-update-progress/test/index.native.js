/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { sendMediaUpload, sendMediaSave } from '@wordpress/react-native-bridge';

/**
 * Internal dependencies
 */
import {
	BlockMediaUpdateProgress,
	MEDIA_UPLOAD_STATE_UPLOADING,
	MEDIA_UPLOAD_STATE_SUCCEEDED,
	MEDIA_UPLOAD_STATE_FAILED,
	MEDIA_UPLOAD_STATE_RESET,
	MEDIA_SAVE_STATE_SAVING,
	MEDIA_SAVE_STATE_SUCCEEDED,
	MEDIA_SAVE_STATE_FAILED,
	MEDIA_SAVE_STATE_RESET,
	MEDIA_SAVE_FINAL_STATE_RESULT,
	MEDIA_SAVE_MEDIAID_CHANGED,
} from '../';

jest.mock( '@wordpress/react-native-bridge', () => {
	const callUploadCallback = ( payload ) => {
		this.uploadCallBack( payload );
	};
	const callSaveCallback = ( payload ) => {
		this.saveCallBack( payload );
	};
	const subscribeMediaUpload = ( callback ) => {
		this.uploadCallBack = callback;
	};
	const subscribeMediaSave = ( callback ) => {
		this.saveCallBack = callback;
	};
	const mediaSources = {
		deviceCamera: 'DEVICE_CAMERA',
		deviceLibrary: 'DEVICE_MEDIA_LIBRARY',
		siteMediaLibrary: 'SITE_MEDIA_LIBRARY',
	};
	return {
		subscribeMediaUpload,
		subscribeMediaSave,
		sendMediaUpload: callUploadCallback,
		sendMediaSave: callSaveCallback,
		mediaSources,
	};
} );

// const MEDIA_ID_REMOTE = 123;
const MEDIA_ID_LOCAL = 2;
const MEDIA_ID_TEMP = 'tempid-0-1';

const tempMediaFiles = [
	{
		alt: '',
		caption: '',
		id: 'tempid-0-1',
		link: '',
		mime: 'image/jpeg',
		type: 'image',
		url: '',
	},
	{
		alt: '',
		caption: '',
		id: 'tempid-0-2',
		link: '',
		mime: 'image/jpeg',
		type: 'image',
		url: '',
	},
];

const localMediaFiles = [
	{
		alt: '',
		caption: '',
		id: '2',
		link: '',
		mime: 'image/jpeg',
		type: 'image',
		url: '',
	},
	{
		alt: '',
		caption: '',
		id: '3',
		link: '',
		mime: 'image/jpeg',
		type: 'image',
		url: '',
	},
];

describe( 'BlockMediaUpdateProgress component', () => {
	it( 'renders without crashing', () => {
		const wrapper = shallow(
			<BlockMediaUpdateProgress renderContent={ () => {} } />
		);
		expect( wrapper ).toBeTruthy();
	} );

	it( 'upload: listens media upload progress for local file', () => {
		const progress = 10;
		const payload = {
			state: MEDIA_UPLOAD_STATE_UPLOADING,
			mediaId: MEDIA_ID_LOCAL,
			progress,
		};

		const onUpdateMediaUploadProgress = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onUpdateMediaUploadProgress={ onUpdateMediaUploadProgress }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaUpload( payload );

		expect( wrapper.instance().state.progress ).toEqual( progress );
		expect( wrapper.instance().state.isUploadInProgress ).toEqual( true );
		expect( wrapper.instance().state.isUploadFailed ).toEqual( false );
		expect( onUpdateMediaUploadProgress ).toHaveBeenCalledTimes( 1 );
		expect( onUpdateMediaUploadProgress ).toHaveBeenCalledWith( payload );
	} );

	// UPLOAD tests
	it( 'upload does not get affected by unrelated media uploads', () => {
		const payload = {
			state: MEDIA_UPLOAD_STATE_UPLOADING,
			mediaId: 432, // id not belonging to assigned mediaFiles collection in test
			progress: 20,
		};
		const onUpdateMediaUploadProgress = jest.fn();
		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onUpdateMediaUploadProgress={ onUpdateMediaUploadProgress }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaUpload( payload );

		expect( wrapper.instance().state.progress ).toEqual( 0 );
		expect( onUpdateMediaUploadProgress ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'upload: listens media upload success', () => {
		const progress = 10;
		const payloadSuccess = {
			state: MEDIA_UPLOAD_STATE_SUCCEEDED,
			mediaId: MEDIA_ID_LOCAL,
		};
		const payloadUploading = {
			state: MEDIA_UPLOAD_STATE_UPLOADING,
			mediaId: MEDIA_ID_LOCAL,
			progress,
		};

		const onFinishMediaUploadWithSuccess = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onFinishMediaUploadWithSuccess={
					onFinishMediaUploadWithSuccess
				}
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaUpload( payloadUploading );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaUpload( payloadSuccess );

		expect( wrapper.instance().state.isUploadInProgress ).toEqual( false );
		expect( onFinishMediaUploadWithSuccess ).toHaveBeenCalledTimes( 1 );
		expect( onFinishMediaUploadWithSuccess ).toHaveBeenCalledWith(
			payloadSuccess
		);
	} );

	it( 'upload: listens media upload fail', () => {
		const progress = 10;
		const payloadFail = {
			state: MEDIA_UPLOAD_STATE_FAILED,
			mediaId: MEDIA_ID_LOCAL,
		};
		const payloadUploading = {
			state: MEDIA_UPLOAD_STATE_UPLOADING,
			mediaId: MEDIA_ID_LOCAL,
			progress,
		};

		const onFinishMediaUploadWithFailure = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onFinishMediaUploadWithFailure={
					onFinishMediaUploadWithFailure
				}
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaUpload( payloadUploading );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaUpload( payloadFail );

		expect( wrapper.instance().state.isUploadInProgress ).toEqual( false );
		expect( wrapper.instance().state.isUploadFailed ).toEqual( true );
		expect( onFinishMediaUploadWithFailure ).toHaveBeenCalledTimes( 1 );
		expect( onFinishMediaUploadWithFailure ).toHaveBeenCalledWith(
			payloadFail
		);
	} );

	it( 'upload: listens media upload reset', () => {
		const progress = 10;
		const payloadReset = {
			state: MEDIA_UPLOAD_STATE_RESET,
			mediaId: MEDIA_ID_LOCAL,
		};
		const payloadUploading = {
			state: MEDIA_UPLOAD_STATE_UPLOADING,
			mediaId: MEDIA_ID_LOCAL,
			progress,
		};

		const onMediaUploadStateReset = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onMediaUploadStateReset={ onMediaUploadStateReset }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaUpload( payloadUploading );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaUpload( payloadReset );

		expect( wrapper.instance().state.isUploadInProgress ).toEqual( false );
		expect( wrapper.instance().state.isUploadFailed ).toEqual( false );
		expect( onMediaUploadStateReset ).toHaveBeenCalledTimes( 1 );
		expect( onMediaUploadStateReset ).toHaveBeenCalledWith( payloadReset );
	} );

	// SAVE tests
	it( 'save does not get affected by unrelated media uploads', () => {
		const payload = {
			state: MEDIA_SAVE_STATE_SAVING,
			mediaId: 'tempid-432', // id not belonging to assigned mediaFiles collection in test
			progress: 20,
		};
		const onUpdateMediaSaveProgress = jest.fn();
		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onUpdateMediaSaveProgress={ onUpdateMediaSaveProgress }
				mediaFiles={ tempMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaSave( payload );

		expect( wrapper.instance().state.progress ).toEqual( 0 );
		expect( onUpdateMediaSaveProgress ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'save: listens media save success', () => {
		const progress = 10;
		const payloadSuccess = {
			state: MEDIA_SAVE_STATE_SUCCEEDED,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
		};
		const payloadSaving = {
			state: MEDIA_SAVE_STATE_SAVING,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			progress,
		};

		const onFinishMediaSaveWithSuccess = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onFinishMediaSaveWithSuccess={ onFinishMediaSaveWithSuccess }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaSave( payloadSaving );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaSave( payloadSuccess );

		expect( wrapper.instance().state.c ).toEqual( false );
		expect( onFinishMediaSaveWithSuccess ).toHaveBeenCalledTimes( 1 );
		expect( onFinishMediaSaveWithSuccess ).toHaveBeenCalledWith(
			payloadSuccess
		);
	} );

	it( 'save: listens media save fail', () => {
		const progress = 10;
		const payloadFail = {
			state: MEDIA_SAVE_STATE_FAILED,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
		};
		const payloadSaving = {
			state: MEDIA_SAVE_STATE_SAVING,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			progress,
		};

		const onFinishMediaSaveWithFailure = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onFinishMediaSaveWithFailure={ onFinishMediaSaveWithFailure }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaSave( payloadSaving );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaSave( payloadFail );

		expect( wrapper.instance().state.isSaveInProgress ).toEqual( false );
		expect( wrapper.instance().state.isSaveFailed ).toEqual( true );
		expect( onFinishMediaSaveWithFailure ).toHaveBeenCalledTimes( 1 );
		expect( onFinishMediaSaveWithFailure ).toHaveBeenCalledWith(
			payloadFail
		);
	} );

	it( 'save: listens media save reset', () => {
		const progress = 10;
		const payloadReset = {
			state: MEDIA_SAVE_STATE_RESET,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
		};
		const payloadSaving = {
			state: MEDIA_SAVE_STATE_SAVING,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			progress,
		};

		const onMediaSaveStateReset = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onMediaSaveStateReset={ onMediaSaveStateReset }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaSave( payloadSaving );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaSave( payloadReset );

		expect( wrapper.instance().state.isSaveInProgress ).toEqual( false );
		expect( wrapper.instance().state.isSaveFailed ).toEqual( false );
		expect( onMediaSaveStateReset ).toHaveBeenCalledTimes( 1 );
		expect( onMediaSaveStateReset ).toHaveBeenCalledWith( payloadReset );
	} );

	it( 'save: listens total media save result, with result: fail', () => {
		const progress = 10;
		const payloadFail = {
			state: MEDIA_SAVE_FINAL_STATE_RESULT,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			success: false,
		};
		const payloadSaving = {
			state: MEDIA_SAVE_STATE_SAVING,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			progress,
		};

		const onFinalSaveResult = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onFinalSaveResult={ onFinalSaveResult }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaSave( payloadSaving );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaSave( payloadFail );

		expect( wrapper.instance().state.isSaveInProgress ).toEqual( false );
		expect( wrapper.instance().state.isSaveFailed ).toEqual( true );
		expect( onFinalSaveResult ).toHaveBeenCalledTimes( 1 );
		expect( onFinalSaveResult ).toHaveBeenCalledWith( payloadFail );
	} );

	it( 'save: listens total media save result, with result: success', () => {
		const progress = 10;
		const payloadSuccess = {
			state: MEDIA_SAVE_FINAL_STATE_RESULT,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			success: true,
		};
		const payloadSaving = {
			state: MEDIA_SAVE_STATE_SAVING,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			progress,
		};

		const onFinalSaveResult = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onFinalSaveResult={ onFinalSaveResult }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaSave( payloadSaving );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaSave( payloadSuccess );

		expect( wrapper.instance().state.isSaveInProgress ).toEqual( false );
		expect( wrapper.instance().state.isSaveFailed ).toEqual( false );
		expect( onFinalSaveResult ).toHaveBeenCalledTimes( 1 );
		expect( onFinalSaveResult ).toHaveBeenCalledWith( payloadSuccess );
	} );

	it( 'save: listens to mediaId change and passes it up', () => {
		const progress = 10;
		const payloadMediaIdChange = {
			state: MEDIA_SAVE_MEDIAID_CHANGED,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			newId: MEDIA_ID_LOCAL,
			mediaUrl: 'file:///folder/someimage.jpg',
		};
		const payloadSaving = {
			state: MEDIA_SAVE_STATE_SAVING,
			mediaId: MEDIA_ID_TEMP, // while saving, we have a tempid key
			progress,
		};

		const onMediaIdChanged = jest.fn();

		const wrapper = shallow(
			<BlockMediaUpdateProgress
				onMediaIdChanged={ onMediaIdChanged }
				mediaFiles={ localMediaFiles }
				renderContent={ () => {} }
			/>
		);

		sendMediaSave( payloadSaving );

		expect( wrapper.instance().state.progress ).toEqual( progress );

		sendMediaSave( payloadMediaIdChange );

		expect( wrapper.instance().state.isSaveInProgress ).toEqual( false );
		expect( wrapper.instance().state.isSaveFailed ).toEqual( false );
		expect( wrapper.instance().state.isUploadInProgress ).toEqual( false );
		expect( wrapper.instance().state.isUploadFailed ).toEqual( false );
		expect( onMediaIdChanged ).toHaveBeenCalledTimes( 1 );
		expect( onMediaIdChanged ).toHaveBeenCalledWith( payloadMediaIdChange );
	} );
} );

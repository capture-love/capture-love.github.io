import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import first from 'lodash/first';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';

import type { Form } from './types';

import DevMenu from './DevMenu';
import { ReactComponent as AddMediaIcon } from './svgs/add_media.svg';
import { ReactComponent as ClearIcon } from './svgs/clear.svg';
import { ReactComponent as HeartMediaIcon } from './svgs/heart_media.svg';
import text from './text.json';
import { UIState } from './types';

const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
const client = new S3Client({
  retryMode: 'standard',
  bucketEndpoint: false,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    accountId: import.meta.env.VITE_AWS_ACCOUNT_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
  region: import.meta.env.VITE_AWS_S3_REGION,
});

function App() {
  const [form, setForm] = useState<Form>({ media: [], message: '', name: '' });
  const fileInput = useRef<HTMLInputElement>(null);
  const formWrapper = useRef<HTMLDivElement>(null);
  const loadingWrapper = useRef<HTMLDivElement>(null);
  const errorWrapper = useRef<HTMLDivElement>(null);
  const successWrapper = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const hasAttachedMedia = first(form.media) instanceof File;

  useEffect(() => {
    const savedName = localStorage.getItem('capture-love-name');
    if (!savedName) return;

    setForm({ ...form, name: savedName });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleAlertMessage = (e) => {
      if (loadingWrapper.current?.classList.contains('hidden')) return;

      e.preventDefault();
      e.returnValue = 'Slanje priloženoga u tijeku...\nMolim nemojte ugasiti uređaj i ovaj prozor dok slanje nije gotovo!';
    };

    window.addEventListener('beforeunload', handleAlertMessage);

    return () => window.removeEventListener('beforeunload', handleAlertMessage);
  }, []);

  const handleFormChange = (key: keyof typeof form, value: string | File[]) => {
    setForm({ ...form, [key]: value });
    if (key === 'name') localStorage.setItem('capture-love-name', value as string);
  };

  const handleImportMedia = () => {
    const inputFiles = fileInput.current?.files;
    if (!inputFiles) return;

    handleFormChange('media', Array.from(inputFiles));
  };

  const handleChooseMedia = () => {
    fileInput.current?.click();
  };

  const handleClearMedia = () => {
    if (fileInput.current) fileInput.current.value = '';
    handleFormChange('media', []);
  };

  const handleUiState = (state: UIState, withCleanup?: boolean, cleanupDelay?: number) => {
    switch (state) {
      case UIState.loading:
        formWrapper.current?.classList.add('hidden');
        successWrapper.current?.classList.add('hidden');
        errorWrapper.current?.classList.add('hidden');
        loadingWrapper.current?.classList.remove('hidden');
        break;

      case UIState.success:
        formWrapper.current?.classList.add('hidden');
        loadingWrapper.current?.classList.add('hidden');
        errorWrapper.current?.classList.add('hidden');
        successWrapper.current?.classList.remove('hidden');
        break;

      case UIState.error:
        formWrapper.current?.classList.add('hidden');
        loadingWrapper.current?.classList.add('hidden');
        successWrapper.current?.classList.add('hidden');
        errorWrapper.current?.classList.remove('hidden');
        break;

      case UIState.default:
      default:
        loadingWrapper.current?.classList.add('hidden');
        successWrapper.current?.classList.add('hidden');
        errorWrapper.current?.classList.add('hidden');
        formWrapper.current?.classList.remove('hidden');
        break;
    }

    if (withCleanup) {
      timeoutRef.current = setTimeout(() => {
        loadingWrapper.current?.classList.add('hidden');
        successWrapper.current?.classList.add('hidden');
        errorWrapper.current?.classList.add('hidden');
        formWrapper.current?.classList.remove('hidden');
      }, cleanupDelay || 5000);
    }
  };

  const handleSend = async () => {
    if (!hasAttachedMedia) return;
    try {
      handleUiState(UIState.loading);

      const requestID = `${new Date().toISOString()}-${nanoid(6)}`;

      let params = map(form.media, (file): PutObjectCommandInput => ({
        Body: file,
        Bucket: bucket,
        Key: `${requestID}/${file.name}`,
      }));

      if (!isEmpty(form.name) || !isEmpty(form.message)) {
        const message = new Blob(
          [`${text.data.name}: ${form.name || text.data.anonymus}\n\n${text.data.message}: ${form.message || ''}`],
          { type: 'text/plain' },
        );

        params = [
          ...params,
          {
            Body: message,
            Bucket: bucket,
            Key: `${requestID}/message.txt`,
          },
        ];
      }

      await Promise.all(map(params, (input) => client.send(new PutObjectCommand(input))));

      handleFormChange('message', '');
      handleClearMedia();
      handleUiState(UIState.success, true, 5000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('ERROR:', err);

      handleFormChange('message', '');
      handleClearMedia();
      handleUiState(UIState.error, true, 10000);
    }
  };

  return (
    <>
      <div className="background" />
      <main>
        <DevMenu onSelect={handleUiState} />
        <div className="header">
          <h1>{import.meta.env.VITE_HEADER}</h1>
          {import.meta.env.VITE_HEADER_DATE && (
            <h2>{import.meta.env.VITE_HEADER_DATE}</h2>
          )}
        </div>
        <div className="content-wrapper">
          <div ref={formWrapper} className="form-wrapper">
            <input
              ref={fileInput}
              onChange={handleImportMedia}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
            />
            <input
              className="text-input"
              placeholder={text.form.name}
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            <textarea
              className="text-input"
              placeholder={text.form.message}
              value={form.message}
              onChange={(e) => handleFormChange('message', e.target.value)}
              rows={5}
            />
            {hasAttachedMedia ? (
              <div className="file-wrapper">
                <ClearIcon className="clear" onClick={handleClearMedia} />
                <h3 className="ready-message">
                  <b>+{form.media.length}</b>
                  <HeartMediaIcon className="icon" />
                  {text.form.attached}
                </h3>
              </div>
            ) : (
              <div className="file-input" onClick={handleChooseMedia}>
                <div className="placeholder">
                  <AddMediaIcon className="icon" />
                  <span>{text.form.media}</span>
                </div>
              </div>
            )}

            <button className="submit" disabled={!hasAttachedMedia} onClick={handleSend}>
              {text.form.submit}
            </button>
          </div>
          <div ref={loadingWrapper} className="loading-wrapper hidden">
            <h3>{text.loading.title}</h3>
            <p>{text.loading.message}</p>
          </div>
          <div ref={errorWrapper} className="error-wrapper hidden">
            <h3>{text.error.title}</h3>
            <p>{text.error.message}</p>
          </div>
          <div ref={successWrapper} className="success-wrapper hidden">
            <h2>{text.success.title}</h2>
            <p>{text.success.message}</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;

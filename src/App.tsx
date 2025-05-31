import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import first from 'lodash/first';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';

import { ReactComponent as AddMediaIcon } from './svgs/add_media.svg';
import { ReactComponent as ClearIcon } from './svgs/clear.svg';
import { ReactComponent as HeartMediaIcon } from './svgs/heart_media.svg';

type Form = {
  media: File[]
  message: string
  name: string
}

const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
const client = new S3Client({
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

  const handleSend = () => {
    if (!hasAttachedMedia) return;
    try {
      formWrapper.current?.classList.add('hidden');
      errorWrapper.current?.classList.add('hidden');
      successWrapper.current?.classList.add('hidden');
      loadingWrapper.current?.classList.remove('hidden');

      const requestID = `${new Date().toISOString()}-${nanoid(6)}`;

      let params = map(form.media, (file): PutObjectCommandInput => ({
        Body: file,
        Bucket: bucket,
        Key: `${requestID}/${file.name}`,
      }));

      if (!isEmpty(form.name) || !isEmpty(form.message)) {
        const message = new Blob(
          [`Ime: ${form.name || 'Anonimno'}\n\nPoruka: ${form.message || ''}`],
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

      Promise.all(map(params, (input) => client.send(new PutObjectCommand(input))))
        .then(() => {
          handleFormChange('message', '');
          handleClearMedia();

          loadingWrapper.current?.classList.add('hidden');
          successWrapper.current?.classList.remove('hidden');

          timeoutRef.current = setTimeout(() => {
            loadingWrapper.current?.classList.add('hidden');
            successWrapper.current?.classList.add('hidden');
            errorWrapper.current?.classList.add('hidden');
            formWrapper.current?.classList.remove('hidden');
          }, 5000);
        }).catch((err) => { throw err; });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('ERROR:', err);

      handleFormChange('message', '');
      handleClearMedia();

      loadingWrapper.current?.classList.add('hidden');
      successWrapper.current?.classList.add('hidden');
      errorWrapper.current?.classList.remove('hidden');

      timeoutRef.current = setTimeout(() => {
        loadingWrapper.current?.classList.add('hidden');
        successWrapper.current?.classList.add('hidden');
        errorWrapper.current?.classList.add('hidden');
        formWrapper.current?.classList.remove('hidden');
      }, 10000);
    }
  };

  return (
    <>
      <div className="background" />
      <main>
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
              id="media"
              onChange={handleImportMedia}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
            />
            <input
              id="primary"
              className="text-input"
              placeholder="Ime / Nadimak"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              autoComplete="off"
            />
            <textarea
              id="message"
              className="text-input"
              placeholder="Poruka za mladence..."
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
                  priloženo
                </h3>
              </div>
            ) : (
              <div className="file-input" onClick={handleChooseMedia}>
                <div className="placeholder">
                  <AddMediaIcon className="icon" />
                  <span>Odaberite slike i videe<br />koje želite podijeliti</span>
                </div>
              </div>
            )}

            <button className="submit" disabled={!hasAttachedMedia} onClick={handleSend}>Pošalji</button>
          </div>
          <div ref={loadingWrapper} className="loading-wrapper hidden">
            <h3>Slanje priloženoga u tijeku...</h3>
            <p>Molim nemojte ugasiti uređaj i ovaj prozor dok slanje nije gotovo!</p>
            <p>Ovisno o broju zapisa i brzini interneta ovo bi moglo potrajati koju minutu.</p>
          </div>
          <div ref={errorWrapper} className="error-wrapper hidden">
            <h3>Ups! Došlo je do greške pri slanju.</h3>
            <p>Molimo provjerite vašu internet vezu i pokušajte ponovno.</p>
            <p>Ako se greška ponovi, pokušajte ponovo kasnije i hvala Vam na razumijevanju.</p>
          </div>
          <div ref={successWrapper} className="success-wrapper hidden">
            <h2>Hvala Vam!</h2>
            <p>Hvala što ste svojim prisustvom uljepšali naš poseban dan i učinili ga nezaboravnim!</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;

import { useEffect, useRef, useState } from "react"
import { PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { nanoid } from 'nanoid';
import first from "lodash/first";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import { ReactComponent as AddMediaIcon } from './svgs/add_media.svg'
import { ReactComponent as HeartMediaIcon } from './svgs/heart_media.svg'
import { ReactComponent as ClearIcon } from './svgs/clear.svg'

type Form = {
  media: File[]
  message: string
  name: string
}

const bucket = import.meta.env.VITE_AWS_S3_BUCKET
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
  const [form, setForm] = useState<Form>({media: [], message: '', name: ''})
  const fileInput = useRef<HTMLInputElement>(null);
  const formWrapper = useRef<HTMLDivElement>(null);
  const thanksWrapper = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hasAttachedMedia = first(form.media) instanceof File

  useEffect(() => {
    const savedName = localStorage.getItem('capture-love-name')
    if (!savedName) return

    setForm({...form, name: savedName})

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleFormChange = (key: keyof typeof form, value: string | File[]) => {
    setForm({...form, [key]: value})
    if (key === 'name') localStorage.setItem('capture-love-name', value as string)
  }

  const handleImportMedia = () => {
    const inputFiles = fileInput.current?.files;
    if (!inputFiles) return

    handleFormChange('media', Array.from(inputFiles));
  };

  const handleChooseMedia = () => {
    fileInput.current?.click()
  }

  const handleClearMedia = () => {
    if (fileInput.current) fileInput.current.value = ''
    handleFormChange('media', []);
  }

  const handleSend = () => {
    if (!hasAttachedMedia) return
    const requestID = `${new Date().toISOString()}-${nanoid(6)}`

    let params = map(form.media, (file): PutObjectCommandInput => ({
      Body: file,
      Bucket: bucket,
      Key: `${requestID}/${file.name}`,
    }));

    if (!isEmpty(form.name) || !isEmpty(form.message)) {
      const message = new Blob(
        [`Ime: ${form.name || 'Anonimno'}\n\nPoruka: ${form.message || ''}`],
        { type: 'text/plain' }
      )

      params = [
        ...params,
        {
          Body: message,
          Bucket: bucket,
          Key: `${requestID}/message.txt`,
        }
      ]
    }

    formWrapper.current?.classList.add('hidden');
    thanksWrapper.current?.classList.remove('hidden');

    Promise.all(map(params, (input) => client.send(new PutObjectCommand(input))))
    .then(() => {
      handleFormChange('message', '');
      handleClearMedia();
    })
    .catch((err) => {
      console.error("ERROR:", err);

      handleFormChange('message', '');
      handleClearMedia();
    })
    .finally(() => {
      timeoutRef.current = setTimeout(() => {
        thanksWrapper.current?.classList.add('hidden');
        formWrapper.current?.classList.remove('hidden');
      }, 5000);
    })
  }

  return (
    <>
      <div className="background" />
      <main>
        <h1 className="header">{import.meta.env.VITE_HEADER}</h1>
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
              placeholder="Ime / Nadimak"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            <textarea
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
          <div ref={thanksWrapper} className="thank-you-card hidden">
            <h2>Hvala Vam!</h2>
            <p>Hvala što ste naš dan učinili nezaboravnim!</p>
          </div>
        </div>
      </main>
    </>
  )
}

export default App

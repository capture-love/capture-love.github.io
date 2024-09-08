import { useEffect, useRef, useState } from "react"
import { ReactComponent as AddMediaIcon } from './svgs/add_media.svg'
import { ReactComponent as HeartMediaIcon } from './svgs/heart_media.svg'
import { ReactComponent as ClearIcon } from './svgs/clear.svg'
import first from "lodash/first";

type Form = {
  media: File[]
  message: string
  name: string
}

function App() {
  const [form, setForm] = useState<Form>({media: [], message: '', name: ''})
  const fileInput = useRef<HTMLInputElement>(null);
  const formWrapper = useRef<HTMLDivElement>(null);
  const thanksWrapper = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

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
    if (!(first(form.media) instanceof File)) return

    formWrapper.current?.classList.add('hidden')
    thanksWrapper.current?.classList.remove('hidden')

    setTimeout(() => {
      handleFormChange('message', '')
      handleClearMedia()
    }, 300)

    timeoutRef.current = setTimeout(() => {
      thanksWrapper.current?.classList.add('hidden')
      formWrapper.current?.classList.remove('hidden')
    }, 5000)
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
            {(first(form.media) instanceof File) ? (
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

            <button className="submit" onClick={handleSend}>Pošalji</button>
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
